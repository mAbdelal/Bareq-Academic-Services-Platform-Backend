const express = require('express');
const router = express.Router();
const {
    createServicePurchase,
    getMyPurchases,
    getPurchaseById,
    providerAcceptPurchase,
    providerRejectPurchase,
    submitDeliverables,
    buyerAcceptSubmission,
    buyerRejectSubmission,
    buyerDispute,
    providerDispute,
    getAllPurchasesForAdmin,
    rateService
} = require('../controllers/servicePurchase.controller');

const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/admin/:service_id', authorize("show_purchases"), getAllPurchasesForAdmin); 

// Buyer Routes
router.post('/', createServicePurchase); 
router.get('/my', getMyPurchases);        
router.get('/:id', getPurchaseById); 

// Provider Routes
router.patch('/:id/accept', providerAcceptPurchase); 
router.patch('/:id/reject', providerRejectPurchase); 
router.patch('/:id/submit', submitDeliverables);   
router.post('/:id/dispute/provider', providerDispute); 

// Buyer Routes 
router.patch('/:id/accept-submission', buyerAcceptSubmission); 
router.patch('/:id/reject-submission', buyerRejectSubmission); 
router.post('/:id/dispute/buyer', buyerDispute); 
router.post('/:id/rate', rateService);

module.exports = router;
