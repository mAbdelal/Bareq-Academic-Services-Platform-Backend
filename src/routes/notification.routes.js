const express = require('express');
const router = express.Router();
const { authorize, authenticate } = require('../middlewares/authMiddleware');


const {
    createAndSendNotification,
    getMyNotifications,
    markAsRead,
    markAllAsRead,
} = require("../controllers/notification.controller");


router.use(authenticate);

router.post('/', authorize('send_notifications'), createAndSendNotification);
router.get('/my', getMyNotifications);
router.patch('/mark-as-read', markAllAsRead);
router.patch('/:id/mark-as-read', markAsRead);

module.exports = router;


