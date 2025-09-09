const prisma = require('../config/prisma');
const { createServicePurchaseDispute } = require('../services/disputes.service');
const Joi = require('joi');
const { BadRequestError, NotFoundError, UnauthorizedError } = require('../utils/errors');
const { success } = require('../utils/response');
const { PLATFORM_COMMISSION_RATE } = require("../config/env")


const createServicePurchase = async (req, res, next) => {
    try {
        const schema = Joi.object({
            service_id: Joi.string().uuid().required(),
        });

        const { service_id } = await schema.validateAsync(req.body);
        const buyer_id = req.user.id;

        // Step 1: Fetch and validate service status
        const service = await prisma.services.findUnique({
            where: { id: service_id },
            select: {
                id: true,
                is_active: true,
                owner_frozen: true,
                admin_frozen: true,
                price: true,
                owner_id: true,
            },
        });

        if (!service) throw new NotFoundError('Service not found');
        if (!service.is_active) throw new BadRequestError('Service is inactive');
        if (service.owner_frozen) throw new BadRequestError('Service is currently frozen by the provider');
        if (service.admin_frozen) throw new BadRequestError('Service is currently frozen by admin');

        const price = service.price;

        const balance = await prisma.userBalances.findUnique({ where: { user_id: buyer_id } });
        if (!balance || balance.balance < price) {
            throw new BadRequestError("Insufficient balance to purchase");
        }

        const purchase = await prisma.$transaction(async (tx) => {
            // Create ServicePurchase
            const purchase = await tx.servicePurchases.create({
                data: {
                    service_id,
                    buyer_id,
                    status: 'pending',
                },
            });

            await tx.purchaseTimeline.create({
                data: {
                    service_purchase_id: purchase.id,
                    user_id: buyer_id,
                    role: 'buyer',
                    action: 'purchase',
                },
            });

            // Find the active negotiation (PENDING) between buyer and provider
            const negotiation = await tx.negotiations.findFirst({
                where: {
                    service_id,
                    buyer_id,
                    provider_id: service.provider_id,
                    status: "pending",
                },
            });

            if (negotiation) {
                // Update negotiation status → agreed
                await tx.negotiations.update({
                    where: { id: negotiation.id },
                    data: { status: "agreed" },
                });

                // Update the chat attached to this negotiation
                if (negotiation.chat) {
                    await tx.chats.update({
                        where: { id: negotiation.chat.id },
                        data: { service_purchase_id: purchase.id },
                    });
                }
            }

            return purchase;
        });

        return success(res, purchase, 'Purchase created successfully');
    } catch (err) {
        next(err);
    }
};




const getMyPurchases = async (req, res, next) => {
    try {
        const buyer_id = req.user.id;

        const purchases = await prisma.servicePurchases.findMany({
            where: { buyer_id },
            orderBy: { created_at: 'desc' },
            include: {
                service: {
                    select: {
                        id: true,
                        title: true,
                        rating: true,
                        provider: {
                            select: {
                                user: {
                                    select: {
                                        first_name_ar: true,
                                        last_name_ar: true,
                                        full_name_en: true,
                                        avart:true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return success(res, { purchases });
    } catch (err) {
        next(err);
    }
};


const getPurchaseById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;


        const purchase = await prisma.servicePurchases.findUnique({
            where: { id },
            include: {
                service: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        rating: true,
                        provider_id: true,
                        buyer_instructions: true,
                        delivery_time_days: true,
                        ratings_count: true,
                        provider: {
                            select: {
                                user: {
                                    select: {
                                        first_name_ar: true,
                                        last_name_ar: true,
                                        full_name_en: true,
                                        avatar: true
                                    }
                                }
                            }
                        }
                    }
                },
                deliverables: {
                    include: {
                        attachments: true
                    }
                },
                timeline: true,
                dispute: {
                    select: {
                        id: true
                    }
                }
            },
        });

        if (!purchase) throw new NotFoundError('Purchase not found');
        if (purchase.buyer_id !== user_id && purchase.service.provider_id !== user_id) throw new BadRequestError('Not authorized to access this purchase');

        return success(res, purchase);
    } catch (err) {
        next(err);
    }
};


const providerAcceptPurchase = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().uuid().required(),
        });

        const { id: purchase_id } = await schema.validateAsync(req.params);
        const provider_id = req.user.id;

        await prisma.$transaction(async (tx) => {
            const purchase = await tx.servicePurchases.findUnique({
                where: { id: purchase_id },
                include: {
                    service: true,
                },
            });

            if (!purchase) {
                throw new NotFoundError("Service purchase not found");
            }

            if (purchase.status !== "pending") {
                throw new BadRequestError("This purchase is not pending");
            }

            const service = purchase.service;

            if (!service || service.provider_id !== provider_id) {
                throw new BadRequestError("You are not authorized to accept this purchase");
            }

            const buyerBalance = await tx.userBalances.findUnique({
                where: { user_id: purchase.buyer_id },
            });

            if (!buyerBalance) {
                throw new NotFoundError("Buyer's balance not found");
            }

            if (buyerBalance.balance < service.price) {
                throw new BadRequestError("Buyer has insufficient balance");
            }

            // Check if purchase was created more than 2 days ago
            const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
            if (purchase.created_at < twoDaysAgo) {
                // Return funds to buyer if previously frozen
                await tx.userBalances.update({
                    where: { user_id: purchase.buyer_id },
                    data: {
                        balance: { increment: service.price },
                        frozen_balance: { decrement: service.price },
                        updated_at: new Date(),
                    },
                });

                // Update purchase status to 'refused'
                await tx.servicePurchases.update({
                    where: { id: purchase_id },
                    data: {
                        status: "refused_due_to_timeout",
                    },
                });

                await tx.purchaseTimeline.create({
                    data: {
                        service_purchase_id: purchase.id,
                        user_id: provider_id,
                        role: 'provider',
                        action: 'ProviderRefusedDueToTimeout',
                    },
                });

                await tx.transactions.create({
                    data: {
                        user_id: purchase.buyer_id,
                        amount: service.price,
                        direction: "debit",
                        reason: "fund_release",
                        payment_method: null,
                        related_service_id: service.id,
                        description: "fund release for service purchase due to timeout",
                    },
                });

                throw new BadRequestError("تجاوزت مهلة اليومان للقبول اسأل المشتري للشراء مرة اخرى")
            }

            // Freeze buyer's balance
            await tx.userBalances.update({
                where: { user_id: purchase.buyer_id },
                data: {
                    balance: { decrement: service.price },
                    frozen_balance: { increment: service.price },
                    updated_at: new Date(),
                },
            });

            // Record transaction
            await tx.transactions.create({
                data: {
                    user_id: purchase.buyer_id,
                    amount: service.price,
                    direction: "debit",
                    reason: "service_payment",
                    payment_method: null,
                    related_service_id: service.id,
                    description: "Frozen balance for service purchase",
                },
            });

            // Mark purchase as in progress
            await tx.servicePurchases.update({
                where: { id: purchase_id },
                data: {
                    status: "in_progress",
                },
            });

            await tx.purchaseTimeline.create({
                data: {
                    service_purchase_id: purchase.id,
                    user_id: purchase.buyer_id,
                    role: 'buyer',
                    action: 'ProviderAccepted',
                },
            });
        });

        return success(res, {}, "Purchase accepted and buyer's funds frozen.");

    } catch (err) {
        next(err);
    }
};


const providerRejectPurchase = async (req, res, next) => {
    try {
        const provider_id = req.user.id;
        const { id } = req.params;

        const purchase = await prisma.servicePurchases.findUnique({
            where: { id },
            include: { service: true },
        });

        if (!purchase) throw new NotFoundError('Purchase not found');
        if (purchase.service.provider_id !== provider_id) {
            throw new UnauthorizedError('Unauthorized: Not your service');
        }
        if (purchase.status !== 'pending') {
            throw new BadRequestError('Purchase is not pending');
        }

        await prisma.$transaction(async (tx) => {
            await tx.servicePurchases.update({
                where: { id },
                data: { status: 'provider_rejected' },
            });

            await tx.purchaseTimeline.create({
                data: {
                    service_purchase_id: purchase.id,
                    user_id: provider_id,
                    role: 'provider',
                    action: 'ProviderRefusedDueToTimeout',
                },
            });
        });

        return success(res, {}, 'Purchase rejected successfully');
    } catch (err) {
        next(err);
    }
};

const finalSubmission = async (req, res, next) => {
    try {
        const provider_id = req.user.id;
        const { id } = req.params;

        const purchase = await prisma.servicePurchases.findUnique({
            where: { id },
            include: { service: true },
        });

        if (!purchase) throw new NotFoundError('Purchase not found');
        if (purchase.service.provider_id !== provider_id) {
            throw new UnauthorizedError('Unauthorized: Not your service');
        }
        if (purchase.status !== 'in_progress') {
            throw new BadRequestError('Purchase must be in progress');
        }

        await prisma.$transaction(async (tx) => {
            await tx.servicePurchases.update({
                where: { id },
                data: { status: 'submitted' },
            });

            await tx.purchaseTimeline.create({
                data: {
                    service_purchase_id: id,
                    user_id: provider_id,
                    role: 'provider',
                    action: 'Submitted',
                },
            })

        });

        return success(res, {}, 'Deliverables submitted');
    } catch (err) {
        next(err);
    }
};

const buyerAcceptSubmission = async (req, res, next) => {
    try {
        const buyer_id = req.user.id;
        const { id } = req.params;

        const purchase = await prisma.servicePurchases.findUnique({
            where: { id },
            include: {
                service: {
                    select: {
                        id: true,
                        price: true,
                        provider_id: true,
                    },
                },
            },
        });

        if (!purchase) throw new NotFoundError('Purchase not found');
        if (purchase.buyer_id !== buyer_id) {
            throw new UnauthorizedError('Unauthorized: Not your purchase');
        }
        if (purchase.status !== 'submitted') {
            throw new BadRequestError('No submission to accept');
        }

        const { price, provider_id } = purchase.service;
        const totalAmount = price;

        const providerAmount = totalAmount * (1 - PLATFORM_COMMISSION_RATE);
        const platformAmount = totalAmount - providerAmount;

        await prisma.$transaction(async (tx) => {
            // 1. Mark purchase as completed
            await tx.servicePurchases.update({
                where: { id },
                data: { status: 'completed' },
            });

            // 2. Add to timeline
            await tx.purchaseTimeline.create({
                data: {
                    service_purchase_id: id,
                    user_id: buyer_id,
                    role: 'buyer',
                    action: 'complete',
                },
            })

            // 3. Update balances
            await tx.userBalances.update({
                where: { user_id: buyer_id },
                data: {
                    frozen_balance: { decrement: totalAmount },
                    updated_at: new Date(),
                },
            });

            await tx.userBalances.update({
                where: { user_id: provider_id },
                data: {
                    balance: { increment: providerAmount },
                    updated_at: new Date(),
                },
            });

            await tx.systemBalance.update({
                where: { id: 1 },
                data: {
                    total_balance: { increment: platformAmount },
                },
            });

            // 4. Log transactions  

            await tx.transactions.create({
                data: {
                    user_id: buyer_id,
                    amount: totalAmount,
                    direction: 'debit',
                    reason: 'fund_release',
                    service_purchase_id: id,
                    description: 'Payment from buyer to provider (service)',
                },
            });

            await tx.transactions.create({
                data: {
                    user_id: provider_id,
                    amount: providerAmount,
                    direction: 'credit',
                    reason: 'service_income',
                    service_purchase_id: id,
                    description: 'Received payment for completed service purchase',
                },
            });

            await tx.transactions.create({
                data: {
                    user_id: null,
                    amount: platformAmount,
                    direction: 'credit',
                    reason: 'platform_commission',
                    service_purchase_id: id,
                    description: `Platform commission for service purchase`,
                },
            });
        });

        return success(res, {}, 'Submission accepted and funds released to provider');
    } catch (err) {
        next(err);
    }
};

const buyerRejectSubmission = async (req, res, next) => {
    try {
        const buyer_id = req.user.id;
        const { id } = req.params;

        const purchase = await prisma.servicePurchases.findUnique({ where: { id } });
        if (!purchase) throw new NotFoundError('Purchase not found');
        if (purchase.buyer_id !== buyer_id) {
            throw new UnauthorizedError('Unauthorized: Not your purchase');
        }

        if (purchase.status !== 'submitted') {
            throw new BadRequestError('No submission to reject');
        }

        await prisma.$transaction([
            prisma.servicePurchases.update({
                where: { id },
                data: { status: 'in_progress' },
            }),

            prisma.purchaseTimeline.create({
                data: {
                    service_purchase_id: id,
                    user_id: buyer_id,
                    role: 'buyer',
                    action: 'buyer_reject',
                },
            })
        ]);

        return success(res, {}, 'Submission rejected');
    } catch (err) {
        next(err);
    }
};
const buyerDispute = async (req, res, next) => {
    try {
        const schema = Joi.object({
            reason: Joi.string().min(10).required(),
            note: Joi.string().allow('', null),
            id: Joi.string().uuid().required(),
        });
        const { reason, note, id: service_purchase_id } = await schema.validateAsync(req.body);

        const buyer_id = req.user.id;

        const purchase = await prisma.servicePurchases.findUnique({
            where: { id: service_purchase_id },
            include: {
                service: { select: { provider_id: true } }
            }
        });

        if (!purchase) throw new NotFoundError('Service purchase not found');
        if (purchase.buyer_id !== buyer_id) throw new UnauthorizedError('You are not the buyer for this purchase');

        let dispute;
        await prisma.$transaction(async (tx) => {
            dispute = await createServicePurchaseDispute({
                tx,
                service_purchase_id,
                complainant_id: buyer_id,
                respondent_id: purchase.service.provider_id,
                description: reason,
                complainant_note: note,
            });

            await tx.servicePurchases.update({
                where: { id: service_purchase_id },
                data: { status: 'disputed_by_buyer' },
            });

            await tx.purchaseTimeline.create({
                data: {
                    service_purchase_id,
                    user_id: buyer_id,
                    role: 'buyer',
                    action: 'DisputeByBuyer',
                },
            });
        });

        return success(res, dispute, 'Dispute raised by buyer');
    } catch (err) {
        next(err);
    }
};

const providerDispute = async (req, res, next) => {
    try {
        const schema = Joi.object({
            reason: Joi.string().min(10).required(),
            note: Joi.string().allow('', null),
            id: Joi.string().uuid().required(),
        });

        const { reason, note, id: service_purchase_id } = await schema.validateAsync(req.body);
        const provider_id = req.user.id;

        const purchase = await prisma.servicePurchases.findUnique({
            where: { id: service_purchase_id },
            include: {
                service: { select: { provider_id: true } },
            },
        });

        if (!purchase) throw new NotFoundError('Service purchase not found');
        if (purchase.service.provider_id !== provider_id) throw new UnauthorizedError('You are not the provider for this purchase');

        let dispute;
        await prisma.$transaction(async (tx) => {
            dispute = await createServicePurchaseDispute({
                tx,
                service_purchase_id,
                complainant_id: provider_id,
                respondent_id: purchase.buyer_id,
                description: reason,
                complainant_note: note,
            });

            await tx.servicePurchases.update({
                where: { id: service_purchase_id },
                data: { status: 'disputed_by_provider' },
            });

            await tx.purchaseTimeline.create({
                data: {
                    service_purchase_id,
                    user_id: provider_id,
                    role: 'provider',
                    action: 'DisputeByProvider',
                },
            });
        });

        return success(res, dispute, 'Dispute raised by provider');
    } catch (err) {
        next(err);
    }
};


const getAllPurchasesForAdmin = async (req, res, next) => {
    try {
        const schema = Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(20),
            status: Joi.string().valid(
                'pending',
                'in_progress',
                'submitted',
                'completed',
                'rejected',
                'disputed_by_provider',
                'disputed_by_buyer'
            ).optional()
        });

        const { page, limit, status } = await schema.validateAsync(req.query);
        const { service_id } = req.params;

        if (!service_id || !/^[0-9a-fA-F-]{36}$/.test(service_id)) {
            throw new BadRequestError('Invalid or missing service_id');
        }

        const skip = (page - 1) * limit;

        const where = {
            service_id,
            ...(status && { status })
        };

        const [total, purchases] = await Promise.all([
            prisma.servicePurchases.count({ where }),
            prisma.servicePurchases.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    buyer: {
                        select: {
                            user: {
                                select: {
                                    id: true,
                                    first_name_ar: true,
                                    last_name_ar: true,
                                    full_name_en: true
                                }
                            }
                        }
                    }
                }
            })
        ]);

        return success(res, {
            meta: {
                total,
                page,
                pages: Math.ceil(total / limit),
                hasNext: skip + purchases.length < total
            },
            purchases
        });

    } catch (err) {
        next(err);
    }
};

const rateService = async (req, res, next) => {
    try {
        const schema = Joi.object({
            rating: Joi.number().integer().min(1).max(5).required(),
            comment: Joi.string().allow(null, '').optional(),
        });

        const { rating, comment } = await schema.validateAsync(req.body);
        const rater_id = req.user.id;
        const service_id = req.params.id;

        const service = await prisma.services.findUnique({
            where: { id: service_id },
            select: {
                id: true,
                rating: true,
                ratings_count: true,
                provider_id: true,
                provider: {
                    select: {
                        user_id: true,
                        rating: true,
                        ratings_count: true,
                    },
                },
            },
        });
        if (!service) throw new NotFoundError("Service not found");

        const ratee_id = service.provider_id;
        if (!service.provider) throw new NotFoundError("Service provider (ratee) not found");

        // Prevent self-rating
        if (rater_id === ratee_id) {
            throw new BadRequestError("You can't rate yourself");
        }

        // Ensure the rater has completed a purchase for this service
        const completedPurchase = await prisma.servicePurchases.findFirst({
            where: {
                service_id,
                buyer_id: rater_id,
                status: 'completed',
            },
        });
        if (!completedPurchase) {
            throw new BadRequestError("You can only rate a service after completing the purchase");
        }

        // Check for existing rating
        const existingRating = await prisma.ratings.findFirst({
            where: { rater_id, service_id },
        });
        if (existingRating) {
            throw new BadRequestError("You have already rated this service");
        }

        // Transaction: create rating and update aggregates
        const ratingRecord = await prisma.$transaction(async (tx) => {
            const newServiceCount = service.ratings_count + 1;
            const newServiceAvg = ((service.rating || 0) * service.ratings_count + rating) / newServiceCount;

            const newUserCount = service.provider.ratings_count + 1;
            const newUserAvg = ((service.provider.rating || 0) * service.provider.ratings_count + rating) / newUserCount;

            const createdRating = await tx.ratings.create({
                data: {
                    rater_id,
                    service_id,
                    rating,
                    comment,
                },
            });

            await tx.services.update({
                where: { id: service_id },
                data: {
                    rating: parseFloat(newServiceAvg.toFixed(2)),
                    ratings_count: newServiceCount,
                },
            });

            await tx.academicUsers.update({
                where: { user_id: ratee_id },
                data: {
                    rating: parseFloat(newUserAvg.toFixed(2)),
                    ratings_count: newUserCount,
                },
            });

            return createdRating;
        });

        return success(res, ratingRecord, "Service rated successfully")

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createServicePurchase,
    getMyPurchases,
    getPurchaseById,
    providerRejectPurchase,
    providerAcceptPurchase,
    finalSubmission,
    buyerDispute,
    providerDispute,
    buyerRejectSubmission,
    buyerAcceptSubmission,
    getAllPurchasesForAdmin,
    rateService
};
