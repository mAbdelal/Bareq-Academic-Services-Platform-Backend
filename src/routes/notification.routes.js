const express = require('express');
const router = express.Router();
const { authorize, authenticate } = require('../middlewares/authMiddleware');


const {
    createAndSendNotification,
    getMyNotifications,
    markAsRead,
    markAllAsRead,
} = require("../controllers/notification.controller");

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: Endpoints for sending and viewing notifications
 */

router.use(authenticate);

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create and send a notification (admin)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       201:
 *         description: Notification sent
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authorize('send_notifications'), createAndSendNotification);

/**
 * @swagger
 * /notifications/my:
 *   get:
 *     summary: Get my notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 */
router.get('/my', getMyNotifications);

/**
 * @swagger
 * /notifications/mark-as-read:
 *   patch:
 *     summary: Mark all my notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Marked as read
 *       401:
 *         description: Unauthorized
 */
router.patch('/mark-as-read', markAllAsRead);

/**
 * @swagger
 * /notifications/{id}/mark-as-read:
 *   patch:
 *     summary: Mark a notification as read by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.patch('/:id/mark-as-read', markAsRead);

module.exports = router;


