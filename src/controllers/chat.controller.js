const Joi = require("joi");
const prisma = require("../config/prisma");
const { BadRequestError, NotFoundError, UnauthorizedError } = require("../utils/errors");
const { success } = require('../utils/response');

const getOrCreateNegotiationChat = async (req, res, next) => {
    try {
        const user_id = req.user.id;

        const schema = Joi.object({
            service_id: Joi.string().uuid().required(),
            buyer_id: Joi.string().uuid().required(),
            provider_id: Joi.string().uuid().required(),
        });

        const { service_id, buyer_id, provider_id } = await schema.validateAsync(req.body);

        if (![buyer_id, provider_id].includes(user_id)) {
            throw new UnauthorizedError("You must be either the buyer or provider to access this chat");
        }

        if (buyer_id === provider_id) {
            throw new BadRequestError("المزود والمالك لا يمكن أن يكونا نفس الشخص");
        }

        // 1️⃣ Check if an active negotiation exists
        let negotiation = await prisma.negotiations.findFirst({
            where: {
                service_id,
                status: "pending",
                OR: [
                    { buyer_id, provider_id },
                    { buyer_id: provider_id, provider_id: buyer_id }, // in case roles were reversed
                ],
            },
            include: {
                chat: {
                    include: { messages: { orderBy: { created_at: "asc" } } },
                },
                buyer: {
                    select: {
                        rating: true,
                        ratings_count: true,
                        user: { select: { id: true, first_name_ar: true, last_name_ar: true, avatar: true } },
                    },
                },
                provider: {
                    select: {
                        rating: true,
                        ratings_count: true,
                        user: { select: { id: true, first_name_ar: true, last_name_ar: true, avatar: true } },
                    },
                },
            },
        });

        // 2️⃣ If negotiation exists, ensure chat exists
        if (negotiation) {
            if (!negotiation.chat) {
                const chat = await prisma.chats.create({
                    data: {
                        negotiation_id: negotiation.id,
                        first_part_id: negotiation.buyer.user.id,
                        second_part_id: negotiation.provider.user.id,
                    },
                    include: { messages: { orderBy: { created_at: "asc" } } },
                });
                negotiation.chat = chat;
            }

            const chatResponse = {
                id: negotiation.chat.id,
                negotiation_id: negotiation.chat.negotiation_id,
                service_purchase_id: negotiation.chat.service_purchase_id || null,
                buyer_id: negotiation.buyer.user.id,
                service_id,
                messages: negotiation.chat.messages,
                firstPart: {
                    id: negotiation.buyer.user.id,
                    first_name_ar: negotiation.buyer.user.first_name_ar,
                    last_name_ar: negotiation.buyer.user.last_name_ar,
                    avatar: negotiation.buyer.user.avatar,
                    rating: negotiation.buyer.rating,
                    rating_count: negotiation.buyer.ratings_count,
                },
                secondPart: {
                    id: negotiation.provider.user.id,
                    first_name_ar: negotiation.provider.user.first_name_ar,
                    last_name_ar: negotiation.provider.user.last_name_ar,
                    avatar: negotiation.provider.user.avatar,
                    rating: negotiation.provider.rating,
                    rating_count: negotiation.provider.ratings_count,
                },
            };

            return success(res, chatResponse);
        }

        // 3️⃣ If not found → create new negotiation + chat
        const result = await prisma.$transaction(async (tx) => {
            const newNegotiation = await tx.negotiations.create({
                data: { service_id, buyer_id, provider_id, status: "pending" },
                include: {
                    buyer: {
                        select: {
                            rating: true,
                            ratings_count: true,
                            user: { select: { id: true, first_name_ar: true, last_name_ar: true, avatar: true } },
                        },
                    },
                    provider: {
                        select: {
                            rating: true,
                            ratings_count: true,
                            user: { select: { id: true, first_name_ar: true, last_name_ar: true, avatar: true } },
                        },
                    },
                },
            });

            const chat = await tx.chats.create({
                data: {
                    negotiation_id: newNegotiation.id,
                    first_part_id: newNegotiation.buyer.user.id,
                    second_part_id: newNegotiation.provider.user.id,
                },
                include: { messages: { orderBy: { created_at: "asc" } } },
            });

            return { negotiation: newNegotiation, chat };
        });

        const chatResponse = {
            id: result.chat.id,
            negotiation_id: result.chat.negotiation_id,
            service_purchase_id: result.chat.service_purchase_id || null,
            buyer_id: result.negotiation.buyer.user.id,
            service_id,
            messages: result.chat.messages,
            firstPart: {
                id: result.negotiation.buyer.user.id,
                first_name_ar: result.negotiation.buyer.user.first_name_ar,
                last_name_ar: result.negotiation.buyer.user.last_name_ar,
                avatar: result.negotiation.buyer.user.avatar,
                rating: result.negotiation.buyer.rating,
                rating_count: result.negotiation.buyer.ratings_count,
            },
            secondPart: {
                id: result.negotiation.provider.user.id,
                first_name_ar: result.negotiation.provider.user.first_name_ar,
                last_name_ar: result.negotiation.provider.user.last_name_ar,
                avatar: result.negotiation.provider.user.avatar,
                rating: result.negotiation.provider.rating,
                rating_count: result.negotiation.provider.ratings_count,
            },
        };

        return success(res, chatResponse);
    } catch (err) {
        next(err);
    }
};


const getOrCreatePurchaseChat = async (req, res, next) => {
    try {
        const user_id = req.user.id;

        const schema = Joi.object({
            purchase_id: Joi.string().uuid().required(),
        });

        const { purchase_id } = await schema.validateAsync(req.params);

        const purchase = await prisma.servicePurchases.findUnique({
            where: { id: purchase_id },
            include: {
                buyer: {
                    select: {
                        rating: true,
                        ratings_count: true,
                        user: {
                            select: {
                                id: true,
                                first_name_ar: true,
                                last_name_ar: true,
                                avatar: true,
                            },
                        },
                    },
                },
                service: {
                    include: {
                        provider: {
                            select: {
                                rating: true,
                                ratings_count: true,
                                user: {
                                    select: {
                                        id: true,
                                        first_name_ar: true,
                                        last_name_ar: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    }
                }
            },
        });

        if (!purchase) throw new NotFoundError("Purchase not found");

        if (
            purchase.buyer.user.id !== user_id &&
            purchase.service.provider.user.id !== user_id
        ) {
            throw new UnauthorizedError("Unauthorized: you are not part of this purchase chat");
        }

        let chat = await prisma.chats.findFirst({
            where: { service_purchase_id: purchase_id },
            include: {
                messages: {
                    orderBy: { created_at: "asc" },
                    include: { attachments: true },
                },
                first_part: true,
                second_part: true,
            },
        });

        if (!chat) {
            chat = await prisma.chats.create({
                data: {
                    service_purchase_id: purchase_id,
                    first_part_id: purchase.buyer.user.id,
                    second_part_id: purchase.service.provider.user.id,
                },
                include: {
                    messages: {
                        orderBy: { created_at: "asc" },
                        include: { attachments: true },
                    },
                    first_part: true,
                    second_part: true,
                },
            });
        }

        const chatResponse = {
            ...chat,
            purchase_id,
            buyer_id: purchase.buyer.user.id,
            provider_id: purchase.service.provider.user.id,
            firstPart: {
                ...purchase.buyer.user,
                rating: purchase.buyer.rating,
                rating_count: purchase.buyer.ratings_count,
            },
            secondPart: {
                ...purchase.service.provider.user,
                rating: purchase.service.provider.rating,
                rating_count: purchase.service.provider.ratings_count,
            },
        };

        return success(res, chatResponse);
    } catch (err) {
        next(err);
    }
};


const createOrGetChatByOffertId = async (req, res, next) => {
    try {
        const user_id = req.user.id;

        const schema = Joi.object({
            offer_id: Joi.string().uuid().required(),
        });

        const { offer_id } = await schema.validateAsync(req.params);

        // Fetch the offer with requester and provider details
        const offer = await prisma.customRequestOffers.findUnique({
            where: { id: offer_id },
            include: {
                request: {
                    select: {
                        id: true,
                        requester_id: true,
                        accepted_offer: {
                            select: {
                                provider_id: true,
                                id: true,
                            },
                        },
                        requester: {
                            select: {
                                rating: true,
                                ratings_count: true,
                                user: {
                                    select: {
                                        id: true,
                                        first_name_ar: true,
                                        last_name_ar: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                },
                provider: {
                    select: {
                        rating: true,
                        ratings_count: true,
                        user: {
                            select: {
                                id: true,
                                first_name_ar: true,
                                last_name_ar: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });

        if (!offer) throw new NotFoundError("Offer not found");

        // Authorization check: user must be requester or provider
        if (
            offer.request.requester.user.id !== user_id &&
            offer.provider.user.id !== user_id
        ) {
            throw new UnauthorizedError("Unauthorized: you are not part of this chat");
        }

        // Try to find existing chat
        let chat = await prisma.chats.findFirst({
            where: { offer_id },
            include: {
                messages: {
                    orderBy: { created_at: "asc" },
                    include: { attachments: true },
                },
                first_part: true,
                second_part: true,
            },
        });

        // If no chat exists, create it
        if (!chat) {
            chat = await prisma.chats.create({
                data: {
                    offer_id,
                    first_part_id: offer.request.requester.user.id,
                    second_part_id: offer.provider.user.id,
                },
                include: {
                    messages: {
                        orderBy: { created_at: "asc" },
                        include: { attachments: true },
                    },
                    first_part: true,
                    second_part: true,
                },
            });
        }

        // Prepare response with participants and offer info
        const chatWithParts = {
            ...chat,
            request_id: offer.request.id,
            requester_id: offer.request.requester_id,
            provider_id: offer.provider.user.id,
            accepted_offer_id: offer.request.accepted_offer.id,
            accepted_offer_provider_id: offer.request.accepted_offer.provider_id,
            firstPart: {
                ...offer.request.requester.user,
                rating: offer.request.requester.rating,
                rating_count: offer.request.requester.ratings_count,
            },
            secondPart: {
                ...offer.provider.user,
                rating: offer.provider.rating,
                rating_count: offer.provider.ratings_count,
            },
        };

        return success(res, chatWithParts);
    } catch (err) {
        next(err);
    }
};


const getOrCreateGeneralChat = async (req, res, next) => {
    try {
        const user_id = req.user.id;

        const schema = Joi.object({
            target_user_id: Joi.string().uuid().required(),
        });

        const { target_user_id } = await schema.validateAsync(req.params);

        if (user_id === target_user_id) {
            throw new BadRequestError("لا يمكنك فتح محادثة مع نفسك");
        }

        let chat = await prisma.chats.findFirst({
            where: {
                negotiation_id: null,
                service_purchase_id: null,
                offer_id: null,
                OR: [
                    { first_part_id: user_id, second_part_id: target_user_id },
                    { first_part_id: target_user_id, second_part_id: user_id },
                ],
            },
            include: {
                messages: {
                    orderBy: { created_at: "asc" },
                    include: { attachments: true },
                },
                first_part: true,
                second_part: true,
            },
        });

        if (!chat) {
            chat = await prisma.chats.create({
                data: {
                    first_part_id: user_id,
                    second_part_id: target_user_id,
                },
                include: {
                    messages: {
                        orderBy: { created_at: "asc" },
                        include: { attachments: true },
                    },
                    first_part: true,
                    second_part: true,
                },
            });
        }

        const chatResponse = {
            ...chat,
            firstPart: {
                id: chat.first_part.id,
                first_name_ar: chat.first_part.first_name_ar,
                last_name_ar: chat.first_part.last_name_ar,
                avatar: chat.first_part.avatar,
            },
            secondPart: {
                id: chat.second_part.id,
                first_name_ar: chat.second_part.first_name_ar,
                last_name_ar: chat.second_part.last_name_ar,
                avatar: chat.second_part.avatar,
            },
        };

        return success(res, chatResponse);
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

        // Fetch chat with all possible relations
        const chat = await prisma.chats.findUnique({
            where: { id: chat_id },
            include: {
                service_purchase: {
                    include: {
                        service: { select: { provider_id: true } },
                    },
                },
                offer: {
                    include: {
                        provider: { select: { user_id: true } },
                        request: { select: { requester_id: true } },
                    },
                },
                negotiation: {
                    select: {
                        buyer_id: true,
                        provider_id: true,
                        service: { select: { provider_id: true } },
                    },
                },
            },
        });

        if (!chat) throw new NotFoundError("Chat not found");

        // Determine participants
        let participants = [];

        if (chat.service_purchase?.service) {
            const buyer_id = chat.service_purchase.buyer_id;
            const provider_id = chat.service_purchase.service.provider_id;
            if (buyer_id && provider_id) participants = [buyer_id, provider_id];
        } else if (chat.offer) {
            const requester_id = chat.offer.request.requester_id;
            const provider_id = chat.offer.provider.user_id;
            if (requester_id && provider_id) participants = [requester_id, provider_id];
        } else if (chat.negotiation) {
            const buyer_id = chat.negotiation.buyer_id;
            const provider_id = chat.negotiation.provider_id;
            if (buyer_id && provider_id) participants = [buyer_id, provider_id];
        }

        if (!participants.includes(sender_id)) {
            throw new BadRequestError("You are not a participant in this chat.");
        }

        if (!content.trim() && (!req.files || req.files.length === 0)) {
            throw new BadRequestError("Message must contain text or attachments.");
        }

        // Create message
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

        // Handle attachments
        if (req.files && req.files.length > 0) {
            const attachmentsData = req.files.map((file) => ({
                message_id: message.id,
                file_url: file.filename,
                file_name: file.originalname,
            }));
            await prisma.messageAttachments.createMany({ data: attachmentsData });
        }

        // Return updated message with attachments
        const updatedMessage = await prisma.messages.findUnique({
            where: { id: message.id },
            include: {
                sender: { select: { id: true, first_name_ar: true } },
                attachments: true,
            },
        });

        // Emit via Socket.IO
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
    getOrCreateNegotiationChat,
    createOrGetChatByOffertId,
    getOrCreatePurchaseChat,
    getOrCreateGeneralChat,
    getChatById,
    sendMessageWithAttachments,
    deleteMessage,
};