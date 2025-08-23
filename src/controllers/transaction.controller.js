const prisma = require('../config/prisma');
const { success } = require('../utils/response');
const Joi = require("joi");


const getUserTransactions = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        const transactions = await prisma.transactions.findMany({
            where: { user_id },
            orderBy: { created_at: "desc" },
        });

        return success(res, transactions);
    } catch (err) {
        next(err);
    }
};

const getMyTransactions = async (req, res, next) => {
    try {
        const user_id = req.user.id;

        const transactions = await prisma.transactions.findMany({
            where: { user_id },
            orderBy: { created_at: "desc" },
        });

        return success(res, transactions);
    } catch (err) {
        next(err);
    }
};

const searchTransactions = async (req, res, next) => {
    try {
        const schema = Joi.object({
            user_id: Joi.string().uuid().optional(),
            admin_id: Joi.string().uuid().optional(),
            direction: Joi.string().valid("credit", "debit").optional(),
            reason: Joi.string().optional(),
            from_date: Joi.date().optional(),
            to_date: Joi.date().optional(),
        });

        const {
            user_id,
            admin_id,
            direction,
            reason,
            from_date,
            to_date,
        } = await schema.validateAsync(req.query);

        const where = {
            ...(user_id && { user_id }),
            ...(admin_id && { admin_id }),
            ...(direction && { direction }),
            ...(reason && { reason }),
            ...(from_date || to_date
                ? {
                    created_at: {
                        ...(from_date && { gte: new Date(from_date) }),
                        ...(to_date && { lte: new Date(to_date) }),
                    },
                }
                : {}),
        };

        const transactions = await prisma.transactions.findMany({
            where,
            orderBy: { created_at: "desc" },
        });

        return success(res, transactions);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getUserTransactions,
    getMyTransactions,
    searchTransactions,
};



