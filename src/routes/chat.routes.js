const express = require('express');

const {
    getOrCreateNegotiationChat,
    createOrGetChatByOffertId,
    getChatById,
    sendMessageWithAttachments,
    deleteMessage,
    getOrCreatePurchaseChat,
    getOrCreateGeneralChat
} = require('../controllers/chat.controller.js');

const { authenticate, authorize } = require('../middlewares/authMiddleware.js');

const router = express.Router();
const upload = require('../middlewares/fileUploadMiddleware.js')

/**
 * @swagger
 * tags:
 *   - name: Chats
 *     description: Endpoints for chatting and messaging
 */

router.use(authenticate);

/**
 * @swagger
 * /chats/negotiation:
 *   post:
 *     summary: Get or create a negotiation chat
 *     tags: [Chats]
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
 *       200:
 *         description: Chat returned or created
 *       401:
 *         description: Unauthorized
 */
router.post('/negotiation', getOrCreateNegotiationChat);

/**
 * @swagger
 * /chats/offer/{offer_id}:
 *   get:
 *     summary: Get or create a chat for an offer
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat returned or created
 *       401:
 *         description: Unauthorized
 */
router.get('/offer/:offer_id', createOrGetChatByOffertId);

/**
 * @swagger
 * /chats/purchase/{purchase_id}:
 *   get:
 *     summary: Get or create a chat for a purchase
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: purchase_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat returned or created
 *       401:
 *         description: Unauthorized
 */
router.get("/purchase/:purchase_id", getOrCreatePurchaseChat);

/**
 * @swagger
 * /chats/general/{target_user_id}:
 *   get:
 *     summary: Get or create a general chat with a user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: target_user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat returned or created
 *       401:
 *         description: Unauthorized
 */
router.get("/general/:target_user_id", getOrCreateGeneralChat);

/**
 * @swagger
 * /chats/{id}:
 *   get:
 *     summary: Get chat by ID (admin)
 *     tags: [Chats]
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
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/:id', authorize('show_chats'), getChatById);

/**
 * @swagger
 * /chats/{id}/messages:
 *   post:
 *     summary: Send a message in a chat (with attachments)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.post('/:id/messages', upload.array('files'), sendMessageWithAttachments);

/**
 * @swagger
 * /chats/{id}/messages/{message_id}:
 *   delete:
 *     summary: Delete a message in a chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: message_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.delete('/:id/messages/:message_id', deleteMessage);

module.exports = router;
