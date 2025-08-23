const Joi = require("joi");
const prisma = require("../config/prisma");
const { BadRequestError, NotFoundError, UnauthorizedError } = require("../utils/errors");
const { success } = require('../utils/response')

const createOrGetChatByServiceId = async (req, res, next) => {
    try {
        const user_id = req.user.id;

        const schema = Joi.object({
            service_purchase_id: Joi.string().uuid().required(),
        });

        const { service_purchase_id } = await schema.validateAsync(req.params);

        const purchase = await prisma.servicePurchases.findUnique({
            where: { id: service_purchase_id },
            include: {
                service: true
            }
        });

        if (!purchase) throw new NotFoundError('purchase not found')

        if (purchase.buyer_id !== user_id && purchase.service.provider_id !== user_id) {
            throw new UnauthorizedError('Unauthorized: you are not part of this chat');
        }

        let chat = await prisma.chats.findUnique({
            where: { service_purchase_id },
            include: {
                messages: {
                    orderBy: { created_at: 'asc' },
                    include: {
                        attachments: true,
                    },
                },
            },
        });


        if (!chat) {
            chat = await prisma.chats.create({
                data: { service_purchase_id },
                include: {
                    messages: {
                        orderBy: { created_at: 'asc' },
                        include: {
                            sender: {
                                select: { id: true, first_name_ar: true },
                            },
                            attachments: true,
                        },
                    },
                },
            });
        }

        return success(res, chat);
    } catch (err) {
        next(err);
    }
};


const createOrGetChatByCustomRequestId = async (req, res, next) => {
    try {
        const user_id = req.user.id;

        const schema = Joi.object({
            custom_request_id: Joi.string().uuid().required(),
        });

        const { custom_request_id } = await schema.validateAsync(req.params);

        const request = await prisma.customRequests.findUnique({
            where: { id: custom_request_id },
            include: {
                accepted_offer: true
            }
        });

        if (!request) throw new NotFoundError('custom request not found');

        if (request.requester_id !== user_id && request.accepted_offer.provider_id) {
            throw new UnauthorizedError('Unauthorized: you are not part of this chat');
        }

        let chat = await prisma.chats.findUnique({
            where: { custom_request_id },
            include: {
                messages: {
                    orderBy: { created_at: 'asc' },
                    include: {
                        attachments: true,
                    },
                },
            },
        });

        if (!chat) {
            chat = await prisma.chats.create({
                data: { custom_request_id },
                include: {
                    messages: {
                        orderBy: { created_at: 'asc' },
                        include: {
                            attachments: true,
                        },
                    },
                },
            });
        }

        return success(res, chat);
    } catch (err) {
        next(err);
    }
};

const getChatById = async (req, res, next) => {
    try {
        const { id } = await Joi.object({
            id: Joi.string().uuid().required(),
        }).validateAsync(req.params);

        const chat = await prisma.chats.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { created_at: 'asc' },
                    include: {
                        attachments: true,
                    },
                },
            },
        });

        if (!chat) throw new NotFoundError('Chat not found');

        return success(res, chat);
    } catch (err) {
        next(err);
    }
};

const sendMessageWithAttachments = async (req, res, next) => {
    try {
        const schema = Joi.object({
            content: Joi.string().allow("").optional(),
        });

        const { id: chat_id } = await Joi.object({
            id: Joi.string().uuid().required(),
        }).validateAsync(req.params);

        const { content = "" } = await schema.validateAsync(req.body);
        const sender_id = req.user.id;

        // Fetch chat with related service/custom request to get participants
        const chat = await prisma.chats.findUnique({
            where: { id: chat_id },
            include: {
                service: {
                    select: {
                        buyer_id: true,
                        service: {
                            select: { provider_id: true },
                        },
                    },
                },
                customRequest: {
                    select: {
                        requester_id: true,
                        accepted_offer: {
                            select: {
                                provider_id: true,
                            },
                        },
                    },
                },
            },
        });

        if (!chat) throw new NotFoundError("Chat not found");

        let participants = [];
        if (chat.service) {
            const buyer_id = chat.service.service?.buyer_id;
            const provider_id = chat.service.provider_id;

            if (buyer_id && provider_id) participants = [buyer_id, provider_id];
        } else if (chat.customRequest) {
            const requester_id = chat.customRequest.requester_id;
            const provider_id = chat.customRequest.acceptedOffer?.provider_id;

            if (requester_id && provider_id) participants = [requester_id, provider_id];
        }

        if (!participants.includes(sender_id)) {
            throw new BadRequestError("You are not a participant in this chat.");
        }

        // Must have content OR files
        if (!content.trim() && (!req.files || req.files.length === 0)) {
            throw new BadRequestError("Message must contain text or attachments.");
        }

        const message = await prisma.messages.create({
            data: {
                chat_id,
                sender_id,
                content: content.trim() || null,
            },
            include: {
                sender: { select: { id: true, first_name_ar: true } },
                attachments: true,
            },
        });

        if (req.files && req.files.length > 0) {
            const attachmentsData = req.files.map((file) => ({
                message_id: message.id,
                file_url: file.filename,
                file_name: file.originalname,
            }));

            await prisma.messageAttachments.createMany({ data: attachmentsData });
        }

        const updatedMessage = await prisma.messages.findUnique({
            where: { id: message.id },
            include: {
                sender: { select: { id: true, first_name_ar: true } },
                attachments: true,
            },
        });

        const io = req.app.get("io");
        io.to(chat_id).emit("new-message", updatedMessage);

        const receiver_id = participants.find((id) => id !== sender_id);
        if (receiver_id) io.to(`user-${receiver_id}`).emit("new-message", updatedMessage);

        return success(res, updatedMessage);
    } catch (err) {
        next(err);
    }
};

const deleteMessage = async (req, res, next) => {
    try {
        const schema = Joi.object({
            message_id: Joi.string().uuid().required(),
            id: Joi.string().uuid().required(),
        });

        const { message_id, id: chat_id } = await schema.validateAsync(req.params);
        const sender_id = req.user.id;

        const message = await prisma.messages.findUnique({ where: { id: message_id } });
        if (!message) throw new NotFoundError("Message not found");

        if (message.sender_id !== sender_id) {
            throw new BadRequestError("You are not authorized to delete this message");
        }

        await prisma.messages.delete({ where: { id: message_id } });

        const io = req.app.get("io");
        io.to(chat_id).emit("message-deleted", { message_id });

        return success(res, {}, "Message deleted");
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createOrGetChatByServiceId,
    createOrGetChatByCustomRequestId,
    getChatById,
    sendMessageWithAttachments,
    deleteMessage,
};