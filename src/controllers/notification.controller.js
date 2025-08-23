const prisma = require("../config/prisma");
const Joi = require("joi");
const { ForbiddenError, NotFoundError } = require("../utils/errors");
const {success} = require("../utils/response");

const createAndSendNotification = async (req, res, next) => {
    try {
        const schema = Joi.object({
            user_id: Joi.string().uuid().required(),
            title: Joi.string().required(),
            message: Joi.string().required(),
        });

        const { user_id, title, message } = await schema.validateAsync(req.body);

        const notification = await prisma.notifications.create({
            data: { user_id, title, message },
        });

        const io = req.app.get("io");
        io.to(`user-${user_id}`).emit("new-notification", notification);

        return success(res, notification, "Notification created and sent.");
    } catch (err) {
        next(err);
    }
};

const getMyNotifications = async (req, res, next) => {
    try {
        const user_id = req.user.id;

        const notifications = await prisma.notifications.findMany({
            where: { user_id },
            orderBy: { created_at: "desc" },
        });

        return success(res, notifications, "Your notifications retrieved.");
    } catch (err) {
        next(err);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const notification = await prisma.notifications.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundError("Notification not found.");
        }

        if (notification.user_id !== user_id) {
            throw new ForbiddenError("You are not allowed to modify this notification.");
        }

        const updated = await prisma.notifications.update({
            where: { id },
            data: { is_read: true },
        });

        return success(res, updated, "Notification marked as read.");
    } catch (err) {
        next(err);
    }
};

const markAllAsRead = async (req, res, next) => {
    try {
        const user_id = req.user.id;

        const result = await prisma.notifications.updateMany({
            where: {
                user_id,
                is_read: false,
            },
            data: {
                is_read: true,
            },
        });

        return success(res, { updatedCount: result.count }, "All notifications marked as read.");
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createAndSendNotification,
    getMyNotifications,
    markAsRead,
    markAllAsRead,
};
