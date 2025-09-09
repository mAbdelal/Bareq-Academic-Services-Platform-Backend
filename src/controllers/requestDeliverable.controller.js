const Joi = require('joi');
const prisma = require('../config/prisma');
const { BadRequestError, NotFoundError ,UnauthorizedError} = require('../utils/errors');
const { success } = require('../utils/response');
const validFileTypes = ['general'];

const createDeliverableWithAttachments = async (req, res, next) => {
    try {
        const schema = Joi.object({
            request_id: Joi.string().uuid().required(),
            message: Joi.string().allow('', null),
            attachments_meta: Joi.any().optional()
        });

        const { request_id, message, attachments_meta } = await schema.validateAsync({
            ...req.body
        });

        const provider_id = req.user.id;

        const request = await prisma.customRequests.findUnique({
            where: { id: request_id },
            include: { accepted_offer: true },
        });
        if (!request) throw new NotFoundError("Request not found");
        if (request.status !== "in_progress")
            throw new BadRequestError("Request not in progress");

        const acceptedOffer = await prisma.customRequestOffers.findUnique({
            where: { id: request.accepted_offer_id },
        });
        if (!acceptedOffer || acceptedOffer.provider_id !== provider_id)
            throw new ForbiddenError("Not provider for this request");

        let parsedMeta = [];
        if (attachments_meta) {
            if (typeof attachments_meta === "string") {
                try {
                    parsedMeta = JSON.parse(attachments_meta);
                } catch {
                    throw new BadRequestError("Invalid attachments_meta JSON.");
                }
            } else {
                parsedMeta = attachments_meta;
            }

            if (!Array.isArray(parsedMeta)) {
                throw new BadRequestError("attachments_meta must be an array.");
            }

            if (!req.files || req.files.length === 0) {
                throw new BadRequestError("لا يوجد ملفات لتسليمها");
            }

            if (parsedMeta.length !== req.files.length) {
                throw new BadRequestError(
                    "Number of metadata entries does not match number of files."
                );
            }

            parsedMeta.forEach((meta, i) => {
                if (!meta.filename || !meta.file_type) {
                    throw new BadRequestError(
                        `Missing filename or file_type in metadata at index ${i}.`
                    );
                }
                if (!validFileTypes.includes(meta.file_type)) {
                    throw new BadRequestError(
                        `Invalid file_type "${meta.file_type}" at index ${i}.`
                    );
                }

                const file = req.files.find((f) => f.originalname === meta.filename);
                if (!file) {
                    throw new BadRequestError(
                        `File "${meta.filename}" not found in uploaded files.`
                    );
                }
            });
        }

        const newDeliverable = await prisma.$transaction(async (tx) => {
            const createdDeliverable = await tx.requestImplementationDeliverables.create({
                data: {
                    custom_request_id: request_id,
                    message,
                    delivered_at: new Date(),
                    is_accepted:undefined,
                    decision_at:undefined,
                },
            });

            if (parsedMeta.length > 0) {
                const attachmentsData = parsedMeta.map((meta) => {
                    const file = req.files.find((f) => f.originalname === meta.filename);
                    return {
                        deliverable_id: createdDeliverable.id,
                        file_url: file.filename,
                        file_name: file.originalname,
                        file_type: meta.file_type,
                    };
                });

                await tx.requestDeliverableAttachments.createMany({
                    data: attachmentsData,
                });
            }

            // Fetch deliverable again with attachments included
            return tx.requestImplementationDeliverables.findUnique({
                where: { id: createdDeliverable.id },
                include: {
                    attachments: true, // assumes relation name is "attachments"
                },
            });
        });

        return success(res, { deliverable: newDeliverable }, "Deliverable submitted successfully");
    } catch (err) {
        next(err);
    }
};


const acceptDeliverable = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().uuid().required(), 
            comment: Joi.string().allow('', null), 
        });

        const { id, comment } = await schema.validateAsync({
            id: req.params.id,
            comment: req.body.comment,
        });

        const owner_id = req.user.id;

        const deliverable = await prisma.requestImplementationDeliverables.findUnique({
            where: { id },
            include: { request: true },
        });
        if (!deliverable) throw new NotFoundError('Deliverable not found');
        if (deliverable.request.requester_id !== owner_id) throw new UnauthorizedError('Not owner of request');
        if (deliverable.request.status !== 'in_progress') throw new BadRequestError('Request not in progress');

        await prisma.requestImplementationDeliverables.update({
            where: { id },
            data: {
                is_accepted: true,
                decision_at: new Date(),
                requester_comment: comment || null,
            },
        });

        return success(res, {}, 'Deliverable accepted, request completed');
    } catch (err) {
        next(err);
    }
};
const rejectDeliverable = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().uuid().required(),
            comment: Joi.string().allow('', null), 
        });

        const { id, comment } = await schema.validateAsync({
            id: req.params.id,
            comment: req.body.comment,
        });

        const owner_id = req.user.id;

        const deliverable = await prisma.requestImplementationDeliverables.findUnique({
            where: { id },
            include: { request: true },
        });

        if (!deliverable) throw new NotFoundError('Deliverable not found');
        if (deliverable.request.requester_id !== owner_id) throw new UnauthorizedError('Not owner of request');
        if (deliverable.request.status !== 'in_progress') throw new BadRequestError('Request not in progress');
        if (deliverable.is_accepted) throw new BadRequestError('Deliverable has already been decided');
        

        await prisma.requestImplementationDeliverables.update({
            where: { id },
            data: {
                is_accepted: false,
                decision_at: new Date(),
                requester_comment: comment || null,
            },
        });

        return success(res, {}, 'Deliverable rejected');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createDeliverableWithAttachments,
    acceptDeliverable,
    rejectDeliverable,

}