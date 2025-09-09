const Joi = require('joi');
const prisma = require('../config/prisma');
const { BadRequestError, NotFoundError, UnauthorizedError } = require('../utils/errors');
const fs = require('fs').promises;
const path = require('path');
const { success } = require('../utils/response');

const validFileTypes = ['general'];

const submitDeliverable = async (req, res, next) => {
    try {
        const { purchase_id } = req.params;
        const provider_id = req.user.id;

        if (!purchase_id) throw new BadRequestError('Missing purchase_id parameter');
        if (!req.files || req.files.length === 0) {
            throw new BadRequestError('No files uploaded');
        }

        let { attachments_meta, message } = req.body;

        if (typeof attachments_meta === 'string') {
            try {
                attachments_meta = JSON.parse(attachments_meta);
            } catch {
                throw new BadRequestError('Invalid JSON in attachments_meta');
            }
        }

        const bodySchema = Joi.object({
            attachments_meta: Joi.array()
                .items(
                    Joi.object({
                        filename: Joi.string().required(),
                        file_type: Joi.string().valid(...validFileTypes).required()
                    })
                )
                .required(),
            message: Joi.string().allow('', null).optional()
        });

        const validated = await bodySchema.validateAsync({ attachments_meta, message });
        attachments_meta = validated.attachments_meta;
        message = validated.message;

        if (attachments_meta.length !== req.files.length) {
            throw new BadRequestError('Mismatch between attachments_meta and uploaded files');
        }

        const purchase = await prisma.servicePurchases.findUnique({
            where: { id: purchase_id },
            include: { service: true }
        });

        if (!purchase) throw new NotFoundError('Purchase not found');
        if (purchase.service.provider_id !== provider_id) {
            throw new UnauthorizedError('You are not authorized to submit for this purchase');
        }
        if (purchase.status !== 'in_progress') {
            throw new BadRequestError('Purchase must be in progress to submit deliverables');
        }

        let createdDeliverable = null;
        let createdAttachments = [];

        await prisma.$transaction(async (tx) => {
            createdDeliverable = await tx.servicePurchaseDeliverables.create({
                data: {
                    purchase_id,
                    message
                }
            });

            const attachmentsData = attachments_meta.map((meta) => {
                const file = req.files.find(f => f.originalname === meta.filename);
                if (!file) {
                    throw new BadRequestError(`File "${meta.filename}" not found in uploaded files`);
                }

                return {
                    deliverable_id: createdDeliverable.id,
                    file_url: file.filename,
                    file_name: file.originalname,
                    file_type: meta.file_type
                };
            });

            await tx.servicePurchaseAttachments.createMany({ data: attachmentsData });
            createdAttachments = attachmentsData;
        });

        createdDeliverable.attachments = createdAttachments;

        return success(
            res,
            createdDeliverable,
            'Deliverables submitted successfully'
        );
    } catch (err) {
        next(err);
    }
};

const acceptDeliverable = async (req, res, next) => {
    try {
        const { id: deliverable_id } = req.params;
        const buyer_id = req.user.id;

        // 1. Validate input
        const schema = Joi.object({
            comment: Joi.string().allow('', null).optional()
        });

        const { comment } = await schema.validateAsync(req.body);

        if (!deliverable_id) {
            throw new BadRequestError('Missing deliverable ID parameter');
        }

        // 2. Get deliverable with purchase
        const deliverable = await prisma.servicePurchaseDeliverables.findUnique({
            where: { id: deliverable_id },
            include: {
                purchase: true
            }
        });

        if (!deliverable) {
            throw new NotFoundError('Deliverable not found');
        }

        const purchase = deliverable.purchase;

        if (!purchase) {
            throw new NotFoundError('Associated purchase not found');
        }

        if (purchase.buyer_id !== buyer_id) {
            throw new UnauthorizedError('You are not authorized to accept this deliverable');
        }

        if (deliverable.is_accepted === true) {
            throw new BadRequestError('Deliverable has already been accepted');
        }

        // 3. Update deliverable only
        await prisma.servicePurchaseDeliverables.update({
            where: { id: deliverable_id },
            data: {
                is_accepted: true,
                decision_at: new Date(),
                buyer_comment: comment || null
            }
        });

        return success(res, {}, 'Deliverable accepted successfully');
    } catch (err) {
        next(err);
    }
};


const rejectDeliverable = async (req, res, next) => {
    try {
        const { id: deliverable_id } = req.params;
        const buyer_id = req.user.id;

        const schema = Joi.object({
            comment: Joi.string().allow('', null).optional()
        });

        const { comment } = await schema.validateAsync(req.body);

        if (!deliverable_id) {
            throw new BadRequestError('Missing deliverable ID parameter');
        }

        const deliverable = await prisma.servicePurchaseDeliverables.findUnique({
            where: { id: deliverable_id },
            include: {
                purchase: true
            }
        });

        if (!deliverable) {
            throw new NotFoundError('Deliverable not found');
        }

        const purchase = deliverable.purchase;

        if (!purchase) {
            throw new NotFoundError('Associated purchase not found');
        }

        if (purchase.buyer_id !== buyer_id) {
            throw new UnauthorizedError('You are not authorized to reject this deliverable');
        }

        if (deliverable.is_accepted === false || deliverable.decision_at) {
            throw new BadRequestError('Deliverable has already been reviewed');
        }

        await prisma.servicePurchaseDeliverables.update({
            where: { id: deliverable_id },
            data: {
                is_accepted: false,
                decision_at: new Date(),
                buyer_comment: comment || null
            }
        });

        return success(res, {}, 'Deliverable rejected successfully');
    } catch (err) {
        next(err);
    }
};


const deleteDeliverable = async (req, res, next) => {
    try {
        const { id: deliverable_id } = req.params;
        const provider_id = req.user.id;

        if (!deliverable_id) {
            throw new BadRequestError('Missing deliverable_id parameter');
        }

        const deliverable = await prisma.servicePurchaseDeliverables.findUnique({
            where: { id: deliverable_id },
            include: {
                purchase: {
                    include: {
                        service: true
                    }
                },
                attachments: true
            }
        });

        if (!deliverable) {
            throw new NotFoundError('Deliverable not found');
        }

        const purchase = deliverable.purchase;

        if (!purchase || purchase.service.provider_id !== provider_id) {
            throw new UnauthorizedError('You are not authorized to delete this deliverable');
        }

        if (deliverable.is_accepted !== null || deliverable.decision_at) {
            throw new BadRequestError('Cannot delete a reviewed deliverable');
        }

        const attachments = deliverable.attachments;

        await prisma.$transaction(async (tx) => {
            await tx.servicePurchaseAttachments.deleteMany({
                where: { deliverable_id }
            });

            await tx.servicePurchaseDeliverables.delete({
                where: { id: deliverable_id }
            });
        });

        // Delete physical files from disk after transaction completes
        for (const attachment of attachments) {
            try {
                const filePath = path.join(__dirname, '..', 'uploads', attachment.file_url);
                await fs.unlink(filePath);
            } catch (err) {
                console.warn(`Failed to delete file: ${attachment.file_url}`, err.message);
            }
        }

        return success(res, {}, 'Deliverable deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    submitDeliverable,
    acceptDeliverable,
    rejectDeliverable,
    deleteDeliverable
};
