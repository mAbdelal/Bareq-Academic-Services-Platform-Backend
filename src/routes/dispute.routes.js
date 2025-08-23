
const express = require('express');
const router = express.Router();

const {
    getCustomRequestDisputeByIdForAdmin,
    getServicePurchaseDisputeByIdForAdmin,
    getMyDisputes,
    searchDisputes,
    getDisputeByIdForUser,
    adminResolveServicePurchaseDispute,
    adminResolveCustomRequestDispute
} = require("../controllers/dispute.controller")

const { authorize, authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.post('/resolve/service-purchase', authorize('resolve_disputes'), adminResolveServicePurchaseDispute);
router.post('/resolve/custom-request', authorize('resolve_disputes'), adminResolveCustomRequestDispute);

router.get('/search/admin', authorize('resolve_disputes'), searchDisputes); // TODO: make pagination

router.get('/:id/service-purchase/admin', authorize('resolve_disputes'), getServicePurchaseDisputeByIdForAdmin);
router.get('/:id/custom-request/admin', authorize('resolve_disputes'), getCustomRequestDisputeByIdForAdmin);

router.get('/:id/user', getDisputeByIdForUser);
router.get('/my', getMyDisputes);

module.exports = router;