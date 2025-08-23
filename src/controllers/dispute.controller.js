const prisma = require("../config/prisma");
const Joi = require("joi");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../utils/errors");
const { success } = require("../utils/response");
const { DISPUTE_PENALTY_RATE, PLATFORM_COMMISSION_RATE } = require("../config/env")


const adminResolveServicePurchaseDispute = async (req, res, next) => {
    try {
        const schema = Joi.object({
            dispute_id: Joi.string().uuid().required(),
            solution: Joi.string().min(5).required(),
            admin_action: Joi.string().valid(
                "refund_buyer",
                "pay_provider",
                "ask_provider_to_redo",
                "split",
                "charge_both"
            ).required()
        });

        const { dispute_id, solution, admin_action } = await schema.validateAsync(req.body);
        const admin_id = req.user.id;

        const dispute = await prisma.disputes.findUnique({
            where: { id: dispute_id },
            include: {
                servicePurchase: {
                    include: { service: true }
                }
            }
        });

        if (!dispute || !dispute.service_purchase_id) {
            throw new NotFoundError("Dispute not found or not related to service purchase");
        }

        if (!["open", "under_review"].includes(dispute.status)) {
            throw new BadRequestError("Dispute already resolved or rejected");
        }

        const { servicePurchase } = dispute;
        const servicePrice = servicePurchase.service.price;
        const buyer_id = servicePurchase.buyer_id;
        const provider_id = servicePurchase.service.provider_id;

        const baseDisputeData = {
            status: admin_action === "ask_provider_to_redo" ? "under_review" : "resolved",
            solution,
            resolved_by_admin_id: admin_id,
            admin_decision_at: new Date()
        };

        const recordTimeline = async (tx, action) => {
            await tx.purchaseTimeline.create({
                data: {
                    service_purchase_id: servicePurchase.id,
                    user_id: admin_id,
                    role: 'admin',
                    action
                }
            });
        };

        if (admin_action === "refund_buyer") {
            await prisma.$transaction(async (tx) => {
                await tx.disputes.update({ where: { id: dispute_id }, data: baseDisputeData });

                await tx.servicePurchases.update({
                    where: { id: dispute.service_purchase_id },
                    data: { status: "completed" }
                });

                await tx.transactions.create({
                    data: {
                        user_id: buyer_id,
                        admin_id,
                        amount: servicePrice,
                        direction: "credit",
                        reason: "dispute_resolution",
                        service_purchase_id: dispute.service_purchase_id,
                        related_dispute_id: dispute.id,
                        description: 'Refunded to buyer'
                    }
                });

                await tx.userBalances.update({
                    where: { user_id: buyer_id },
                    data: {
                        balance: { increment: servicePrice },
                        frozen_balance: { decrement: servicePrice }
                    }
                });

                await recordTimeline(tx, "AdminRefundBuyer");
            });

            return success(res, {}, "Refunded buyer and dispute resolved");
        }

        if (admin_action === "pay_provider") {
            await prisma.$transaction(async (tx) => {
                const providerAmount = servicePrice * (1 - PLATFORM_COMMISSION_RATE);
                const platformAmount = servicePrice - providerAmount;

                await tx.disputes.update({ where: { id: dispute_id }, data: baseDisputeData });

                await tx.servicePurchases.update({
                    where: { id: dispute.service_purchase_id },
                    data: { status: "completed" }
                });

                // Update balances
                await tx.userBalances.update({
                    where: { user_id: buyer_id },
                    data: {
                        frozen_balance: { decrement: servicePrice },
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

                // Log transactions separately
                await tx.transactions.createMany({
                    data: [
                        {
                            user_id: buyer_id,
                            admin_id,
                            amount: servicePrice,
                            direction: "debit",
                            reason: "dispute_resolution",
                            service_purchase_id: dispute.service_purchase_id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: Paid to provider'
                        },
                        {
                            user_id: provider_id,
                            admin_id,
                            amount: providerAmount,
                            direction: "credit",
                            reason: "dispute_resolution",
                            service_purchase_id: dispute.service_purchase_id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: Paid to provider'
                        },
                        {
                            user_id: null,
                            admin_id,
                            amount: platformAmount,
                            direction: "credit",
                            reason: "dispute_resolution",
                            service_purchase_id: dispute.service_purchase_id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: Paid to provider'
                        }
                    ]
                });

                await recordTimeline(tx, "AdminPayProvider");
            });

            return success(res, {}, "Paid provider and dispute resolved");
        }

        if (admin_action === "split") {
            const platformAmount = servicePrice * PLATFORM_COMMISSION_RATE;
            const half = (servicePrice - platformAmount) / 2;

            await prisma.$transaction(async (tx) => {
                await tx.disputes.update({ where: { id: dispute_id }, data: baseDisputeData });

                await tx.servicePurchases.update({
                    where: { id: dispute.service_purchase_id },
                    data: { status: "completed" }
                });

                await tx.transactions.createMany({
                    data: [
                        {
                            user_id: buyer_id,
                            admin_id,
                            amount: half,
                            direction: "debit",
                            reason: "dispute_resolution",
                            service_purchase_id: dispute.service_purchase_id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: Half refund to buyer'
                        },
                        {
                            user_id: provider_id,
                            admin_id,
                            amount: half,
                            direction: "credit",
                            reason: "dispute_resolution",
                            service_purchase_id: dispute.service_purchase_id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: Half refund to buyer'
                        },
                        {
                            user_id: null,
                            admin_id,
                            amount: platformAmount,
                            direction: "credit",
                            reason: "dispute_resolution",
                            service_purchase_id: dispute.service_purchase_id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: Half refund to buyer'
                        }
                    ]
                });

                await tx.userBalances.update({
                    where: { user_id: buyer_id },
                    data: {
                        balance: { increment: half },
                        frozen_balance: { decrement: servicePrice }
                    }
                });

                await tx.userBalances.update({
                    where: { user_id: provider_id },
                    data: { balance: { increment: half } }
                });

                await tx.systemBalance.update({
                    where: { id: 1 },
                    data: {
                        total_balance: { increment: platformAmount },
                    },
                });

                await recordTimeline(tx, "AdminSplitPayment");
            });

            return success(res, {}, "Split payment/refund executed and dispute resolved");
        }

        if (admin_action === "charge_both") {
            const penalty = servicePrice * Number(DISPUTE_PENALTY_RATE);

            await prisma.$transaction(async (tx) => {
                await tx.disputes.update({ where: { id: dispute_id }, data: baseDisputeData });

                await tx.servicePurchases.update({
                    where: { id: dispute.service_purchase_id },
                    data: { status: "completed" }
                });

                await tx.transactions.createMany({
                    data: [
                        {
                            user_id: buyer_id,
                            admin_id,
                            amount: penalty,
                            direction: "debit",
                            reason: "dispute_resolution",
                            service_purchase_id: dispute.service_purchase_id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: Buyer paid penalty'
                        },
                        {
                            user_id: provider_id,
                            admin_id,
                            amount: penalty,
                            direction: "debit",
                            reason: "dispute_resolution",
                            service_purchase_id: dispute.service_purchase_id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: Provider paid penalty'
                        },
                        {
                            user_id: null,
                            admin_id,
                            amount: penalty * 2,
                            direction: "credit",
                            reason: "dispute_resolution",
                            service_purchase_id: dispute.service_purchase_id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: penalty'
                        }
                    ]
                });

                await tx.userBalances.update({
                    where: { user_id: buyer_id },
                    data: {
                        balance: { increment: servicePrice - penalty },
                        frozen_balance: { decrement: servicePrice }
                    }
                });

                await tx.userBalances.update({
                    where: { user_id: provider_id },
                    data: { balance: { decrement: penalty } }
                });

                await tx.systemBalance.update({
                    where: { id: 1 },
                    data: { total_balance: { increment: penalty * 2 } }
                });

                await recordTimeline(tx, "AdminChargeBoth");
            });

            return success(res, {}, "Penalties applied to both, system balance updated, and dispute resolved");
        }

        if (admin_action === "ask_provider_to_redo") {
            await prisma.$transaction(async (tx) => {
                await tx.disputes.update({ where: { id: dispute_id }, data: baseDisputeData });

                await tx.servicePurchases.update({
                    where: { id: dispute.service_purchase_id },
                    data: { status: "in_progress" }
                });

                await recordTimeline(tx, "AdminAskRedo");
            });

            return success(res, {}, "Asked provider to redo work, dispute marked under review");
        }

    } catch (err) {
        next(err);
    }
};

const getMyDisputes = async (req, res, next) => {
    try {
        const user_id = req.user.id;

        const disputes = await prisma.disputes.findMany({
            where: {
                OR: [
                    { complainant_id: user_id },
                    { respondent_id: user_id }
                ]
            },
            orderBy: { created_at: "desc" }
        });

        const disputesWithRole = disputes.map(dispute => {
            let userRole = null;
            if (dispute.complainant_id === user_id) userRole = "complainant";
            else if (dispute.respondent_id === user_id) userRole = "respondent";

            return {
                ...dispute,
                userRole
            };
        });

        return success(res, disputesWithRole, "Your disputes");
    } catch (err) {
        next(err);
    }
};


const adminResolveCustomRequestDispute = async (req, res, next) => {
    try {
        const schema = Joi.object({
            dispute_id: Joi.string().uuid().required(),
            solution: Joi.string().min(5).required(),
            admin_action: Joi.string().valid(
                "refund_owner",
                "pay_provider",
                "ask_provider_to_redo",
                "split",
                "charge_both"
            ).required()
        });

        const { dispute_id, solution, admin_action } = await schema.validateAsync(req.body);
        const admin_id = req.user.id;

        const dispute = await prisma.disputes.findUnique({
            where: { id: dispute_id },
            include: {
                customRequest: {
                    include: {
                        accepted_offer: true
                    }
                }
            }
        });

        if (!dispute || !dispute.custom_request_id) {
            throw new NotFoundError("Dispute not found or not related to custom request");
        }

        if (!["open", "under_review"].includes(dispute.status)) {
            throw new BadRequestError("Dispute already resolved or rejected");
        }

        const { customRequest } = dispute;
        const requestPrice = customRequest.accepted_offer.price;
        const owner_id = customRequest.requester_id;
        const provider_id = customRequest.accepted_offer.provider_id;

        if (!provider_id) {
            throw new BadRequestError("No accepted offer/provider linked to this request");
        }

        const baseDisputeData = {
            status: admin_action === "ask_provider_to_redo" ? "under_review" : "resolved",
            solution,
            resolved_by_admin_id: admin_id,
            admin_decision_at: new Date()
        };

        const recordTimeline = async (tx, action) => {
            await tx.customRequestTimeline.create({
                data: {
                    request_id: customRequest.id,
                    actor_id: admin_id,
                    actor_role: 'admin',
                    action
                }
            });
        };

        if (admin_action === "refund_owner") {
            await prisma.$transaction(async (tx) => {
                await tx.disputes.update({ where: { id: dispute_id }, data: baseDisputeData });
                await tx.customRequests.update({
                    where: { id: customRequest.id },
                    data: { status: "completed" }
                });

                await tx.transactions.create({
                    data: {
                        user_id: owner_id,
                        admin_id,
                        amount: requestPrice,
                        direction: "credit",
                        reason: "dispute_resolution",
                        custom_request_id: customRequest.id,
                        related_dispute_id: dispute.id,
                        description: 'Dispute resolution: Refunded to owner'
                    }
                });

                await tx.userBalances.update({
                    where: { user_id: owner_id },
                    data: {
                        balance: { increment: requestPrice },
                        frozen_balance: { decrement: requestPrice }
                    }
                });

                await recordTimeline(tx, "AdminRefundBuyer");
            });

            return success(res, {}, "Refunded owner and dispute resolved");
        }

        if (admin_action === "pay_provider") {
            await prisma.$transaction(async (tx) => {
                const providerAmount = requestPrice * (1 - PLATFORM_COMMISSION_RATE);
                const platformAmount = requestPrice - providerAmount;

                await tx.disputes.update({ where: { id: dispute_id }, data: baseDisputeData });
                await tx.customRequests.update({
                    where: { id: customRequest.id },
                    data: { status: "completed" }
                });

                await tx.userBalances.update({
                    where: { user_id: owner_id },
                    data: {
                        frozen_balance: { decrement: requestPrice },
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

                await tx.transactions.createMany({
                    data: [
                        {
                            user_id: owner_id,
                            admin_id,
                            amount: requestPrice,
                            direction: "debit",
                            reason: "dispute_resolution",
                            custom_request_id: customRequest.id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: Paid to provider'
                        },
                        {
                            user_id: provider_id,
                            admin_id,
                            amount: providerAmount,
                            direction: "credit",
                            reason: "dispute_resolution",
                            custom_request_id: customRequest.id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: Paid to provider'
                        },
                        {
                            user_id: null,
                            admin_id,
                            amount: platformAmount,
                            direction: "credit",
                            reason: "dispute_resolution",
                            custom_request_id: customRequest.id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: Paid to provider'
                        }
                    ]
                });


                await recordTimeline(tx, "AdminPayProvider");
            });

            return success(res, {}, "Paid provider and dispute resolved");
        }

        if (admin_action === "split") {
            const platformAmount = requestPrice * PLATFORM_COMMISSION_RATE;
            const half = (requestPrice - platformAmount) / 2;


            await prisma.$transaction(async (tx) => {
                await tx.disputes.update({ where: { id: dispute_id }, data: baseDisputeData });
                await tx.customRequests.update({
                    where: { id: customRequest.id },
                    data: { status: "completed" }
                });

                await tx.transactions.createMany({
                    data: [
                        {
                            user_id: owner_id,
                            admin_id,
                            amount: half,
                            direction: "debit",
                            reason: "dispute_resolution",
                            custom_request_id: customRequest.id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: Half refund to owner'
                        },
                        {
                            user_id: provider_id,
                            admin_id,
                            amount: half,
                            direction: "credit",
                            reason: "dispute_resolution",
                            custom_request_id: customRequest.id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: Half payment to provider'
                        },
                        {
                            user_id: null,
                            admin_id,
                            amount: platformAmount,
                            direction: "credit",
                            reason: "dispute_resolution",
                            custom_request_id: customRequest.id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: split the price'
                        }
                    ]
                });

                await tx.userBalances.update({
                    where: { user_id: owner_id },
                    data: {
                        balance: { increment: half },
                        frozen_balance: { decrement: requestPrice }
                    }
                });

                await tx.userBalances.update({
                    where: { user_id: provider_id },
                    data: { balance: { increment: half } }
                });


                await tx.systemBalance.update({
                    where: { id: 1 },
                    data: {
                        total_balance: { increment: platformAmount },
                    },
                });

                await recordTimeline(tx, "AdminSplitPayment");
            });

            return success(res, {}, "Split payment/refund executed and dispute resolved");
        }

        if (admin_action === "charge_both") {
            const penalty = requestPrice * Number(DISPUTE_PENALTY_RATE);

            await prisma.$transaction(async (tx) => {
                await tx.disputes.update({ where: { id: dispute_id }, data: baseDisputeData });
                await tx.customRequests.update({
                    where: { id: customRequest.id },
                    data: { status: "completed" }
                });

                await tx.transactions.createMany({
                    data: [
                        {
                            user_id: owner_id,
                            admin_id,
                            amount: penalty,
                            direction: "debit",
                            reason: "dispute_resolution",
                            custom_request_id: customRequest.id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: Owner paid penalty'
                        },
                        {
                            user_id: provider_id,
                            admin_id,
                            amount: penalty,
                            direction: "debit",
                            reason: "dispute_resolution",
                            custom_request_id: customRequest.id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: Provider paid penalty'
                        },
                        {
                            user_id: null,
                            admin_id,
                            amount: penalty * 2,
                            direction: "credit",
                            reason: "dispute_resolution",
                            custom_request_id: customRequest.id,
                            related_dispute_id: dispute.id,
                            description: 'Dispute resolution: add penalty to platform'
                        }
                    ]
                });

                await tx.userBalances.update({
                    where: { user_id: owner_id },
                    data: {
                        balance: { increment: requestPrice - penalty },
                        frozen_balance: { decrement: requestPrice }
                    }
                });

                await tx.userBalances.update({
                    where: { user_id: provider_id },
                    data: { balance: { decrement: penalty } }
                });

                await tx.systemBalance.update({
                    where: { id: 1 },
                    data: { total_balance: { increment: penalty * 2 } }
                });

                await recordTimeline(tx, "AdminChargeBoth");
            });

            return success(res, {}, "Penalties applied to both, system balance updated, and dispute resolved");
        }

        if (admin_action === "ask_provider_to_redo") {
            await prisma.$transaction(async (tx) => {
                await tx.disputes.update({ where: { id: dispute_id }, data: baseDisputeData });
                await tx.customRequests.update({
                    where: { id: customRequest.id },
                    data: { status: "in_progress" }
                });

                await recordTimeline(tx, "AdminAskRedo");
            });

            return success(res, {}, "Asked provider to redo work, dispute marked under review");
        }
    } catch (err) {
        next(err);
    }
};

const searchDisputes = async (req, res, next) => {
    try {
        const schema = Joi.object({
            status: Joi.string().valid("open", "under_review", "resolved", "rejected").optional(),
            complainant_id: Joi.string().uuid().optional(),
            respondent_id: Joi.string().uuid().optional(),
            from_date: Joi.date().optional(),
            to_date: Joi.date().optional()
        });

        const { status, complainant_id, respondent_id, from_date, to_date } = await schema.validateAsync(req.query);

        const filters = {};
        if (status) filters.status = status;
        if (complainant_id) filters.complainant_id = complainant_id;
        if (respondent_id) filters.respondent_id = respondent_id;
        if (from_date || to_date) {
            filters.created_at = {
                ...(from_date && { gte: new Date(from_date) }),
                ...(to_date && { lte: new Date(to_date) })
            };
        }

        const disputes = await prisma.disputes.findMany({
            where: filters,
            orderBy: { created_at: "desc" },
            include: {
                complainant: true,
                respondent: true,
                resolvedByAdmin: true
            }
        });

        return success(res, disputes, "Disputes found");
    } catch (err) {
        next(err);
    }
};


const getServicePurchaseDisputeByIdForAdmin = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().uuid().required()
        });
        const { id } = await schema.validateAsync(req.params);

        const dispute = await prisma.disputes.findUnique({
            where: { id },
            include: {
                complainant: true,
                respondent: true,
                resolvedByAdmin: true,
                servicePurchase: {
                    include: {
                        service: true,
                        buyer: true,
                        deliverables: {
                            include: {
                                attachments: true
                            }
                        },
                        disputes: true,
                        timeline: {
                            include: {
                                user: true
                            }
                        },
                        transaction: true,
                        chat: {
                            include: {
                                messages: {
                                    include: {
                                        attachments: true,
                                        sender: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!dispute || !dispute.service_purchase_id) {
            throw new NotFoundError("Service purchase dispute not found");
        }

        return success(res, dispute, "Service purchase dispute details");
    } catch (err) {
        next(err);
    }
};

const getCustomRequestDisputeByIdForAdmin = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().uuid().required()
        });
        const { id } = await schema.validateAsync(req.params);

        const dispute = await prisma.disputes.findUnique({
            where: { id },
            include: {
                complainant: true,
                respondent: true,
                resolvedByAdmin: true,
                customRequest: {
                    include: {
                        requester: true,
                        accepted_offer: true,
                        offers: true,
                        attachments: true,
                        dispute: true,
                        transactions: true,
                        deliverables: {
                            include: {
                                attachments: true
                            }
                        },
                        CustomRequestTimeline: true,
                        chat: {
                            include: {
                                messages: {
                                    include: {
                                        attachments: true,
                                        sender: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!dispute || !dispute.custom_request_id) {
            throw new NotFoundError("Custom request dispute not found");
        }

        return success(res, dispute, "Custom request dispute details");
    } catch (err) {
        next(err);
    }
};

const getDisputeByIdForUser = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().uuid().required()
        });

        const { id } = await schema.validateAsync(req.params);
        const user_id = req.user.id;

        const dispute = await prisma.disputes.findUnique({
            where: { id },
            include: {
                customRequest: true,
                servicePurchase: true,
                resolvedByAdmin: true,
                transactions: true
            }
        });

        if (!dispute) {
            throw new NotFoundError("Dispute not found");
        }

        if (dispute.complainant_id !== user_id && dispute.respondent_id !== user_id) {
            throw new ForbiddenError("You are not authorized to view this dispute");
        }

        return success(res, dispute, "Dispute details");
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getCustomRequestDisputeByIdForAdmin,
    getServicePurchaseDisputeByIdForAdmin,
    getMyDisputes,
    searchDisputes,
    getDisputeByIdForUser,
    adminResolveServicePurchaseDispute,
    adminResolveCustomRequestDispute
}