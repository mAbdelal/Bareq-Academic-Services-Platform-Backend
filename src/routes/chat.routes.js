const express = require('express');

const {
    createOrGetChatByServiceId,
    createOrGetChatByCustomRequestId,
    getChatById,
    sendMessageWithAttachments,
    deleteMessage,
} = require('../controllers/chat.controller.js');

const { authenticate, authorize } = require('../middlewares/authMiddleware.js');

const router = express.Router();
const upload = require('../middlewares/fileUploadMiddleware.js')

router.use(authenticate);

router.get('/purchase/:service_purchase_id', createOrGetChatByServiceId);
router.get('/custom-request/:custom_request_id', createOrGetChatByCustomRequestId);
router.get('/:id', authorize('show_chats'), getChatById);

router.post('/:id/messages', upload.array('files'), sendMessageWithAttachments);
router.delete('/:id/messages/:message_id', deleteMessage);

module.exports = router;
