const express = require('express');
const router = express.Router();
const {
    submitDeliverable,
    acceptDeliverable,
    rejectDeliverable,
    deleteDeliverable
} = require('../controllers/serviceDeliverable.controller');
const { authenticate } = require('../middlewares/authMiddleware'); 
const upload = require('../middlewares/fileUploadMiddleware'); 

router.use(authenticate);

router.post('/:purchase_id',upload.array('files'),submitDeliverable);

router.patch('/:id/accept',acceptDeliverable);

router.patch('/:id/reject',rejectDeliverable);

router.delete('/:id', deleteDeliverable);

module.exports = router;
