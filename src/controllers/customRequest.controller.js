const Joi = require('joi');
const prisma = require('../config/prisma');
const { success } = require('../utils/response');
const { NotFoundError, BadRequestError, UnauthorizedError, ForbiddenError } = require('../utils/errors');
const { PLATFORM_COMMISSION_RATE } = require("../config/env");
const fs = require('fs');
const path = require('path');
const { createCustomRequestDispute } = require("../services/disputes.service")

const searchRequestsForAdmin = async (req, res, next) => {
    try {
        const schema = Joi.object({
            page: Joi.number().min(1).default(1),
            limit: Joi.number().min(1).max(100).default(10),

            title: Joi.string().allow('', null),
            status: Joi.string().valid(
                'open', 'in_progress', 'submitted', 'disputed_by_provider',
                'disputed_by_owner', 'owner_rejected', 'completed'
            ),
            requester_id: Joi.string().uuid(),
            academic_category_id: Joi.number().integer(),
            academic_subcategory_id: Joi.number().integer(),

            expected_delivery_days: Joi.number().integer().min(1),
            min_budget: Joi.number().min(0),
            max_budget: Joi.number().min(0),
            skills: Joi.alternatives().try(
                Joi.array().items(Joi.string()),
                Joi.string()
            ).optional(),
        });

        const {
            page, limit, title, status, requester_id,
            academic_category_id, academic_subcategory_id,
            expected_delivery_days, min_budget, max_budget, skills
        } = await schema.validateAsync(req.query);

        let skillsArray = [];
        if (typeof skills === 'string') {
            skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
        } else if (Array.isArray(skills)) {
            skillsArray = skills;
        }

        const where = {
            ...(title && { title: { contains: title, mode: 'insensitive' } }),
            ...(status && { status }),
            ...(requester_id && { requester_id }),
            ...(academic_category_id && { academic_category_id }),
            ...(academic_subcategory_id && { academic_subcategory_id }),
            ...(expected_delivery_days && { expected_delivery_days }),
            ...(min_budget && max_budget && { budget: { gte: min_budget, lte: max_budget } }),
            ...(min_budget && !max_budget && { budget: { gte: min_budget } }),
            ...(!min_budget && max_budget && { budget: { lte: max_budget } }),
            ...(skillsArray.length > 0 && { skills: { hasSome: skillsArray } }),
        };

        const [requests, total] = await prisma.$transaction([
            prisma.customRequests.findMany({
                where,
                include: {
                    requester: true,
                    accepted_offer: true,
                    category: true,
                    subcategory: true,
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
            prisma.customRequests.count({ where }),
        ]);

        return success(res, { total, page, limit, data: requests });
    } catch (err) {
        next(err);
    }
};

const searchRequestsForPublic = async (req, res, next) => {
    try {
        const schema = Joi.object({
            page: Joi.number().min(1).default(1),
            limit: Joi.number().min(1).max(100).default(10),

            title: Joi.string().allow('', null),
            academic_category_id: Joi.number().integer(),
            academic_subcategory_id: Joi.number().integer(),

            min_delivery_days: Joi.number().integer().min(1),
            max_delivery_days: Joi.number().integer().min(1),

            min_budget: Joi.number().min(0),
            max_budget: Joi.number().min(0),

            skills: Joi.alternatives().try(
                Joi.string().allow(''),        // comma separated string
                Joi.array().items(Joi.string()) // array of strings
            ),
        });

        const {
            page,
            limit,
            title,
            academic_category_id,
            academic_subcategory_id,
            min_delivery_days,
            max_delivery_days,
            min_budget,
            max_budget,
            skills,
        } = await schema.validateAsync(req.query);

        let skillsArray = [];
        if (typeof skills === 'string' && skills.length > 0) {
            skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
        } else if (Array.isArray(skills)) {
            skillsArray = skills;
        }

        const where = {
            status: 'open',
            ...(title && { title: { contains: title, mode: 'insensitive' } }),
            ...(academic_category_id && { academic_category_id }),
            ...(academic_subcategory_id && { academic_subcategory_id }),
            // Range for expected_delivery_days
            ...(min_delivery_days && max_delivery_days && { expected_delivery_days: { gte: min_delivery_days, lte: max_delivery_days } }),
            ...(min_delivery_days && !max_delivery_days && { expected_delivery_days: { gte: min_delivery_days } }),
            ...(!min_delivery_days && max_delivery_days && { expected_delivery_days: { lte: max_delivery_days } }),
            ...(min_budget && max_budget && { budget: { gte: min_budget, lte: max_budget } }),
            ...(min_budget && !max_budget && { budget: { gte: min_budget } }),
            ...(!min_budget && max_budget && { budget: { lte: max_budget } }),
            ...(skillsArray.length > 0 && { skills: { hasSome: skillsArray } }),
        };

        const [requests, total] = await prisma.$transaction([
            prisma.customRequests.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    budget: true,
                    expected_delivery_days: true,
                    created_at: true,
                    academic_category_id: true,
                    academic_subcategory_id: true,
                    skills: true,
                    requester: {
                        select: {
                            user_id: true,
                            user: {
                                select: {
                                    id: true,
                                    first_name_ar: true,
                                    last_name_ar: true,
                                    full_name_en: true,
                                    avatar:true
                                },
                            }
                        },
                    },
                    category: true,
                    subcategory: true,
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
            prisma.customRequests.count({ where }),
        ]);

        return success(res, { total, page, limit, data: requests });
    } catch (err) {
        next(err);
    }
};


const getRequestByIdForAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;

        const request = await prisma.customRequests.findUnique({
            where: { id },
            include: {
                requester: {
                    select: {
                        user_id: true,
                        user: {
                            select: {
                                id: true,
                                first_name_ar: true,
                                last_name_ar: true,
                                full_name_en: true,
                            },
                        }
                    },
                },
                accepted_offer: true,
                category: true,
                subcategory: true,
                attachments: true,
                deliverables: true,
                rating: true,
                dispute: true,
                transactions: true,
                CustomRequestTimeline: {
                    orderBy: { created_at: 'asc' },
                },
            },
        });

        if (!request) throw new NotFoundError('Request not found');

        return success(res, request);
    } catch (err) {
        next(err);
    }
};


const getRequestByIdForPublic = async (req, res, next) => {
    try {
        const { id } = req.params;

        const request = await prisma.customRequests.findFirst({
            where: {
                id,
                status: 'open',
            },
            select: {
                id: true,
                title: true,
                description: true,
                budget: true,
                expected_delivery_days: true,
                created_at: true,
                skills: true,
                requester: {
                    select: {
                        user_id: true,
                        user: {
                            select: {
                                full_name_en: true,
                                first_name_ar: true,
                                last_name_ar: true,
                                avatar: true
                            },
                        },
                    },
                },
                category: true,
                subcategory: true,
                attachments: true,

                offers: {
                    select: {
                        id: true,
                        provider_id: true,
                        price: true,
                        delivery_days: true,
                        message: true,
                        created_at: true,
                        updated_at: true,
                        provider: {
                            select: {
                                user: {
                                    select: {
                                        full_name_en: true,
                                        last_name_ar: true,
                                        first_name_ar: true,
                                        avatar:true
                                    },
                                }
                            }
                        },
                        attachments: {
                            select: {
                                id: true,
                                file_url: true,
                                file_name: true,
                                file_type: true,
                                created_at: true,
                            },
                        },
                    },
                    orderBy: {
                        created_at: 'desc',
                    },
                },
            },
        });

        if (!request) throw new NotFoundError('Request not found or not available for public view');

        return success(res, request);
    } catch (err) {
        next(err);
    }
};

const getMyOffers = async (req, res, next) => {
    try {
        const userId = req.user.id; 

        const offers = await prisma.customRequestOffers.findMany({
            where: {
                provider_id: userId,
            },
            select: {
                id: true,
                price: true,
                delivery_days: true,
                message: true,
                created_at: true,
                updated_at: true,

                // related request info
                request: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        budget: true,
                        accepted_offer_id:true,
                        expected_delivery_days: true,
                        status: true,
                        created_at: true,
                        requester: {
                            select: {
                                user: {
                                    select: {
                                        full_name_en: true,
                                        first_name_ar: true,
                                        last_name_ar: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                        category: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        subcategory: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },

                // offer attachments
                attachments: {
                    select: {
                        id: true,
                        file_url: true,
                        file_name: true,
                        file_type: true,
                        created_at: true,
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });


        return success(res, offers);
    } catch (err) {
        next(err);
    }
};



const getMyRequests = async (req, res, next) => {
    try {
        const user_id = req.user.id;

        const requests = await prisma.customRequests.findMany({
            where: { requester_id: user_id },
            orderBy: { created_at: 'desc' },
            include: {
                accepted_offer: true,
                category: true,
                subcategory: true,
            },
        });

        return success(res, requests);
    } catch (err) {
        next(err);
    }
};


const getMyRequestByID = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const { id } = req.params;

        const request = await prisma.customRequests.findUnique({
            where: { id },
            include: {
                accepted_offer: {
                    include: {
                        provider: {
                            include: {
                                user: true,
                            }
                        },
                    }
                },
                attachments: true,
                category: true,
                subcategory: true,
                offers: {
                    include: {
                        provider: {
                            include: {
                                user: true,
                            }
                        },
                    }
                },
                requester: {
                    include: {
                        user: true,
                    }
                },
                CustomRequestTimeline: { orderBy: { created_at: 'asc' } },
                dispute:{
                    select:{
                        id:true
                    }
                },
                deliverables: {
                    include: {
                        attachments: true,
                    }
                }
            },
        });

        if (!request) throw new NotFoundError('Request not found');
        if (request.requester_id !== user_id) {
            throw new UnauthorizedError('You are not the owner of this request');
        }

        return success(res, request);
    } catch (err) {
        next(err);
    }
};

const createRequestWithAttachments = async (req, res, next) => {
    try {
        const requester_id = req.user.id;
        const validFileTypes = ['gallery_image', 'gallery_video', 'general', 'cover'];

        // Parse skills if it's a string
        if (typeof req.body.skills === 'string') {
            try {
                req.body.skills = JSON.parse(req.body.skills);
            } catch {
                throw new BadRequestError('Invalid skills JSON.');
            }
        }

        if (req.body.academic_category_id) {
            req.body.academic_category_id = Number(req.body.academic_category_id);
        }

        if (req.body.academic_subcategory_id === 'null') {
            req.body.academic_subcategory_id = null;
        } else if (req.body.academic_subcategory_id) {
            req.body.academic_subcategory_id = Number(req.body.academic_subcategory_id);
        } else {
            req.body.academic_subcategory_id = null;
        }


        // Validate request input
        const requestInputSchema = Joi.object({
            academic_category_id: Joi.number().integer().required(),
            academic_subcategory_id: Joi.number().integer().optional().allow(null),

            title: Joi.string().min(3).max(255).required(),
            description: Joi.string().min(10).required(),

            budget: Joi.number().positive().required(),
            expected_delivery_days: Joi.number().integer().positive().required(),

            skills: Joi.array().items(Joi.string().min(1)).required(),
        }).unknown(true);

        const data = await requestInputSchema.validateAsync(req.body);

        // Parse attachments metadata
        let attachments_meta = req.body.attachments_meta || [];
        if (typeof attachments_meta === 'string') {
            try {
                attachments_meta = JSON.parse(attachments_meta);
            } catch {
                throw new BadRequestError('Invalid attachments_meta JSON.');
            }
        }

        if (!Array.isArray(attachments_meta)) {
            throw new BadRequestError('attachments_meta must be an array.');
        }

        const files = req.files || [];

        if (attachments_meta.length !== files.length) {
            throw new BadRequestError('Number of attachments_meta items does not match number of uploaded files.');
        }

        // Validate each file_type
        attachments_meta.forEach(({ file_type }, i) => {
            if (!validFileTypes.includes(file_type)) {
                throw new BadRequestError(`Invalid file_type "${file_type}" at index ${i}.`);
            }
        });

        // Remove attachments_meta from data for Prisma
        const { attachments_meta: _, ...prismaData } = data;

        const newRequest = await prisma.$transaction(async (tx) => {
            const request = await tx.customRequests.create({
                data: {
                    ...prismaData,
                    requester_id,
                    status: 'open',
                },
            });

            await tx.customRequestTimeline.create({
                data: {
                    request_id: request.id,
                    actor_id: requester_id,
                    actor_role: 'owner',
                    action: 'request_created',
                },
            });

            if (files.length > 0) {
                const attachmentsData = attachments_meta.map((meta) => {
                    const file = files.find(f => f.originalname === meta.file_name);
                    if (!file) {
                        throw new BadRequestError(`File "${meta.file_name}" not found in uploaded files.`);
                    }
                    return {
                        custom_request_id: request.id,
                        file_url: file.filename,
                        file_name: meta.file_name,
                        file_type: meta.file_type,
                    };
                });

                await tx.customRequestAttachments.createMany({ data: attachmentsData });
            }

            return request;
        });

        return success(res, newRequest, 'Request created with attachments');
    } catch (err) {
        next(err);
    }
};



const deleteRequest = async (req, res, next) => {
    try {
        const { id: request_id } = req.params;
        const requester_id = req.user.id;

        if (!request_id) {
            throw new BadRequestError("Missing request_id parameter");
        }

        const request = await prisma.customRequests.findUnique({
            where: { id: request_id },
            select: { requester_id: true, status: true },
        });

        if (!request) {
            throw new NotFoundError("Custom request not found");
        }

        if (request.requester_id !== requester_id) {
            throw new UnauthorizedError("You are not allowed to delete this request");
        }

        if (request.status !== "open") {
            throw new BadRequestError("the request not open");
        }

        await prisma.customRequests.delete({
            where: { id: request_id },
        });

        return success(res, {}, "Request deleted successfully");
    } catch (err) {
        next(err);
    }
};




const createOffer = async (req, res, next) => {
    const offerSchema = Joi.object({
        price: Joi.number().positive().required(),
        delivery_days: Joi.number().integer().positive().required(),
        message: Joi.string().required(),
        attachments_meta: Joi.alternatives().try(
            Joi.array().items(
                Joi.object({
                    filename: Joi.string().required(),
                    file_type: Joi.string().valid('general').required()
                })
            ),
            Joi.string()
        ).optional(),
    });

    try {
        const provider_id = req.user.id;
        const { id: custom_request_id } = req.params;

        if (!custom_request_id) {
            throw new BadRequestError('custom_request_id is required in URL params');
        }

        if (req.body.attachments_meta && typeof req.body.attachments_meta === 'string') {
            try {
                req.body.attachments_meta = JSON.parse(req.body.attachments_meta);
            } catch {
                throw new BadRequestError('Invalid attachments_meta JSON format');
            }
        }

        const {
            price,
            delivery_days,
            message,
            attachments_meta
        } = await offerSchema.validateAsync(req.body, { abortEarly: false });


        if (attachments_meta && (!req.files || req.files.length !== attachments_meta.length)) {
            throw new BadRequestError('Mismatch between attachments_meta and uploaded files count');
        }

        const result = await prisma.$transaction(async (tx) => {
            // Prevent duplicate offer per provider/request
            const existing = await tx.customRequestOffers.findUnique({
                where: {
                    custom_request_id_provider_id: {
                        custom_request_id,
                        provider_id,
                    },
                },
            });

            if (existing) {
                throw new BadRequestError('You have already submitted an offer for this request.');
            }

            const offer = await tx.customRequestOffers.create({
                data: {
                    custom_request_id,
                    provider_id,
                    price,
                    delivery_days,
                    message,
                },
            });

            let uploadedAttachments = [];

            if (attachments_meta && req.files?.length > 0) {
                uploadedAttachments = attachments_meta.map((meta) => {
                    const file = req.files.find(f => f.originalname === meta.filename);
                    if (!file) {
                        throw new BadRequestError(`File "${meta.filename}" not found in upload`);
                    }

                    return {
                        offer_id: offer.id,
                        file_url: file.filename,
                        file_name: file.originalname,
                        file_type: 'general',
                    };
                });

                await tx.offersAttachments.createMany({
                    data: uploadedAttachments,
                });
            }

            return { offer, attachments: uploadedAttachments };
        });

        return success(res, result, 'Offer submitted successfully');
    } catch (error) {
        next(error);
    }
};

const deleteOffer = async (req, res, next) => {
    try {
        const { id: custom_request_id } = req.params;
        const provider_id = req.user.id;

        if (!custom_request_id) throw new BadRequestError('Missing custom_request_id parameter');

        const offer = await prisma.customRequestOffers.findUnique({
            where: {
                custom_request_id_provider_id: {
                    custom_request_id,
                    provider_id,
                },
            },
            include: {
                attachments: true,
            },
        });

        if (!offer) throw new NotFoundError('Offer not found or you are not the owner');

        await prisma.$transaction(async (tx) => {
            if (offer.attachments?.length) {
                for (const attachment of offer.attachments) {
                    await tx.offersAttachments.delete({ where: { id: attachment.id } });

                    const filePath = path.join(__dirname, '..', '..', 'uploads', attachment.file_name);
                    try {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    } catch (err) {
                        console.warn(`Failed to delete file at ${filePath}:`, err.message);
                    }
                }
            }

            await tx.customRequestOffers.delete({
                where: {
                    custom_request_id_provider_id: {
                        custom_request_id,
                        provider_id,
                    },
                },
            });
        });

        return success(res, null, 'Offer deleted successfully');
    } catch (error) {
        next(error);
    }
};

const acceptOffer = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().uuid().required(),
            offer_id: Joi.string().uuid().required(),
        });

        const { id: request_id, offer_id } = await schema.validateAsync(req.params);
        const owner_id = req.user.id;

        const request = await prisma.customRequests.findUnique({
            where: { id: request_id },
            include: {
                offers: true,
            },
        });

        if (!request) throw new NotFoundError('Request not found');
        if (request.requester_id !== owner_id) throw new ForbiddenError('Not owner of request');
        if (request.status !== 'open') throw new BadRequestError('Request is not open');

        const offer = request.offers.find((o) => o.id === offer_id);
        if (!offer) throw new BadRequestError('Offer does not belong to request');

        const offerPrice = offer.price;

        // Check requester balance before transaction
        const balance = await prisma.userBalances.findUnique({ where: { user_id: owner_id } });
        if (!balance || balance.balance < offerPrice) {
            throw new BadRequestError("Insufficient balance to accept offer");
        }

        await prisma.$transaction(async (tx) => {
            // 1. Freeze funds (balance -> frozen_balance)
            await tx.userBalances.update({
                where: { user_id: owner_id },
                data: {
                    balance: { decrement: offerPrice },
                    frozen_balance: { increment: offerPrice },
                    updated_at: new Date(),
                },
            });

            // 2. Log transaction
            await tx.transactions.create({
                data: {
                    user_id: owner_id,
                    amount: offerPrice,
                    direction: "debit",
                    reason: "custom_request_payment",
                    custom_request_id: request_id,
                    description: `Funds frozen for custom request offer #${offer_id}`,
                }
            });


            // 3. Update request status and accepted offer
            await tx.customRequests.update({
                where: { id: request_id },
                data: {
                    accepted_offer_id: offer_id,
                    status: "in_progress",
                    updated_at: new Date(),
                },
            });

            // 4. Log timeline
            await tx.customRequestTimeline.create({
                data: {
                    request_id,
                    actor_id: owner_id,
                    actor_role: "owner",
                    action: "offer_accepted",
                },
            });
        });

        return success(res, {}, "Offer accepted and balance frozen");
    } catch (err) {
        next(err);
    }
};


const submitRequest = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().uuid().required(),
        });

        const { id } = await schema.validateAsync(req.params);
        const provider_id = req.user.id;

        const request = await prisma.customRequests.findUnique({
            where: { id },
            include: { accepted_offer: true },
        });

        if (!request) throw new NotFoundError('Request not found');
        if (!request.accepted_offer || request.accepted_offer.provider_id !== provider_id)
            throw new ForbiddenError('You are not the provider for this request');

        if (request.status !== 'in_progress')
            throw new BadRequestError('Request is not in progress');

        await prisma.$transaction(async (tx) => {
            await tx.customRequests.update({
                where: { id },
                data: {
                    status: 'submitted',
                    updated_at: new Date(),
                },
            });

            await tx.customRequestTimeline.create({
                data: {
                    request_id: id,
                    actor_id: provider_id,
                    actor_role: 'provider',
                    action: 'submit',
                },
            });
        });

        return success(res, {}, 'Request marked as finished by provider');
    } catch (err) {
        next(err);
    }
};


const acceptSubmission = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().uuid().required(),
        });

        const { id } = await schema.validateAsync(req.params);
        const owner_id = req.user.id;

        const request = await prisma.customRequests.findUnique({
            where: { id },
            include: {
                accepted_offer: true,
            },
        });

        if (!request) throw new NotFoundError('Request not found');
        if (request.requester_id !== owner_id) throw new ForbiddenError('You are not the owner');
        if (request.status !== 'submitted')
            throw new BadRequestError('Request must be submitted to accept');

        const offer = request.accepted_offer;
        if (!offer) throw new BadRequestError("No accepted offer found");

        const provider_id = offer.provider_id;
        const price = offer.price;
        const commission = price * PLATFORM_COMMISSION_RATE;
        const providerAmount = price - commission;

        await prisma.$transaction(async (tx) => {
            // 1. Decrease frozen balance from buyer
            await tx.userBalances.update({
                where: { user_id: owner_id },
                data: {
                    frozen_balance: {
                        decrement: price,
                    },
                },
            });

            // 2. Increase available balance for provider
            await tx.userBalances.update({
                where: { user_id: provider_id },
                data: {
                    balance: {
                        increment: providerAmount,
                    },
                },
            });

            // 3. Update System Balance
            await tx.systemBalance.update({
                where: { id: 1 },
                data: {
                    total_balance: {
                        increment: commission,
                    },
                },
            });

            // 4. Record the transactions
            await tx.transactions.createMany({
                data: [
                    {
                        user_id: owner_id,
                        amount: price,
                        direction: "debit",
                        reason: "fund_release",
                        custom_request_id: id,
                        description: "Payment from buyer to provider (custom request)"
                    },
                    {
                        user_id: provider_id,
                        amount: providerAmount,
                        direction: "credit",
                        reason: "custom_request_income",
                        custom_request_id: id,
                        description: "Received payment for completed custom request"
                    },
                    {
                        user_id: null,
                        amount: commission,
                        direction: "credit",
                        reason: "platform_commission",
                        custom_request_id: id,
                        description: `Platform commission for custom request: id:${id}`
                    }
                ],
            });

            // 5. Update request status to completed
            await tx.customRequests.update({
                where: { id },
                data: {
                    status: 'completed',
                    updated_at: new Date(),
                },
            });

            // 6. Log to timeline
            await tx.customRequestTimeline.create({
                data: {
                    request_id: id,
                    actor_id: owner_id,
                    actor_role: 'owner',
                    action: 'complete',
                },
            });
        });

        return success(res, {}, 'Submission accepted and request marked as completed');
    } catch (error) {
        next(error);
    }
};


const rateCustomRequest = async (req, res, next) => {
    try {
        const schema = Joi.object({
            rating: Joi.number().integer().min(1).max(5).required(),
            comment: Joi.string().allow('', null)
        });
        const { rating, comment } = await schema.validateAsync(req.body);
        const custom_request_id = req.params.id;
        const rater_id = req.user.id;

        const customRequest = await prisma.customRequests.findUnique({
            where: { id: custom_request_id },
            include: {
                accepted_offer: true,
                requester: true,
                rating: true
            }
        });

        if (!customRequest) {
            throw new NotFoundError("Custom request not found");
        }

        // Only requester can rate
        if (customRequest.requester_id !== rater_id) {
            throw new BadRequestError("You are not authorized to rate this request");
        }

        // Ensure accepted offer exists and is delivered/accepted
        const acceptedOffer = customRequest.accepted_offer;
        if (!acceptedOffer) {
            throw new BadRequestError("Custom request has no accepted offer");
        }

        const provider_id = acceptedOffer.provider_id;

        // Prevent duplicate rating
        if (customRequest.rating_id) {
            throw new BadRequestError("You have already rated this request");
        }

        const provider = await prisma.academicUsers.findUnique({
            where: { user_id: provider_id },
            select: { user_id: true, rating: true, ratings_count: true }
        });

        if (!provider) {
            throw new NotFoundError("Provider not found");
        }

        const result = await prisma.$transaction(async (tx) => {
            const newRating = await tx.ratings.create({
                data: {
                    rater_id,
                    custom_request_id,
                    rating,
                    comment
                }
            });

            await tx.customRequests.update({
                where: { id: custom_request_id },
                data: {
                    rating_id: newRating.id
                }
            });

            const newCount = provider.ratings_count + 1;
            const newAvg = ((provider.rating || 0) * provider.ratings_count + rating) / newCount;

            await tx.academicUsers.update({
                where: { user_id: provider_id },
                data: {
                    rating: parseFloat(newAvg.toFixed(2)),
                    ratings_count: newCount
                }
            });

            return newRating;
        });

        return success(res, result, 'Request rated successfully');
    } catch (error) {
        next(error);
    }
};

const disputeByProvider = async (req, res, next) => {
    try {
        const schema = Joi.object({
            request_id: Joi.string().uuid().required(),
            description: Joi.string().min(10).required(),
            complainant_note: Joi.string().allow('', null),
        });

        const { request_id, description, complainant_note } = await schema.validateAsync(req.body);
        const provider_id = req.user.id;

        const request = await prisma.customRequests.findUnique({
            where: { id: request_id },
            include: { accepted_offer: true },
        });
        if (!request) throw new NotFoundError('Request not found');
        if (request.accepted_offer?.provider_id !== provider_id) throw new ForbiddenError('Not the provider');
        if (!['in_progress', 'submitted', 'owner_rejected'].includes(request.status)) {
            throw new BadRequestError('Cannot dispute at this status');
        }

        let dispute;
        await prisma.$transaction(async (tx) => {
            dispute = await createCustomRequestDispute({
                tx,
                custom_request_id: request_id,
                complainant_id: provider_id,
                respondent_id: request.requester_id,
                description,
                complainant_note,
            });

            await tx.customRequests.update({
                where: { id: request_id },
                data: { status: 'disputed_by_provider', updated_at: new Date() },
            });

            await tx.customRequestTimeline.create({
                data: {
                    request_id,
                    actor_id: provider_id,
                    actor_role: 'provider',
                    action: 'dispute_provider',
                },
            });
        });

        return success(res, { dispute }, 'Dispute initiated by provider');
    } catch (err) {
        next(err);
    }
};

const disputeByOwner = async (req, res, next) => {
    try {
        const schema = Joi.object({
            request_id: Joi.string().uuid().required(),
            description: Joi.string().min(10).required(),
            complainant_note: Joi.string().allow('', null),
        });

        const { request_id, description, complainant_note } = await schema.validateAsync(req.body);
        const owner_id = req.user.id;

        const request = await prisma.customRequests.findUnique({
            where: { id: request_id },
            include: { accepted_offer: true },
        });
        if (!request) throw new NotFoundError('Request not found');
        if (request.requester_id !== owner_id) throw new ForbiddenError('Not owner');
        if (!['in_progress', 'submitted'].includes(request.status)) {
            throw new BadRequestError('Cannot dispute at this status');
        }

        let dispute;
        await prisma.$transaction(async (tx) => {
            dispute = await createCustomRequestDispute({
                tx,
                custom_request_id: request_id,
                complainant_id: owner_id,
                respondent_id: request.accepted_offer.provider_id,
                description,
                complainant_note,
            });

            await tx.customRequests.update({
                where: { id: request_id },
                data: { status: 'disputed_by_owner', updated_at: new Date() },
            });

            await tx.customRequestTimeline.create({
                data: {
                    request_id,
                    actor_id: owner_id,
                    actor_role: 'owner',
                    action: 'dispute_owner',
                },
            });
        });

        return success(res, { dispute }, 'Dispute initiated by owner');
    } catch (err) {
        next(err);
    }
};






module.exports = {
    searchRequestsForAdmin,
    searchRequestsForPublic,
    getRequestByIdForAdmin,
    getRequestByIdForPublic,
    deleteRequest,
    createRequestWithAttachments,
    getMyRequestByID,
    getMyRequests,
    createOffer,
    deleteOffer,
    acceptOffer,
    acceptSubmission,
    submitRequest,
    rateCustomRequest,
    disputeByProvider,
    disputeByOwner,
    getMyOffers
}


