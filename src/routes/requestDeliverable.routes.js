const express = require('express');
const router = express.Router();
const {
    createDeliverableWithAttachments,
    acceptDeliverable,
    rejectDeliverable,
} = require('../controllers/requestDeliverable.controller');

const upload = require('../middlewares/fileUploadMiddleware');
const { authenticate } = require('../middlewares/authMiddleware');
router.use(authenticate);

router.post('/', upload.array('files'), createDeliverableWithAttachments);
router.patch('/:id/accept', acceptDeliverable);
router.patch('/:id/reject', rejectDeliverable);


module.exports = router;
