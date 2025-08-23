const express = require('express');
const router = express.Router();
const upload = require('../middlewares/fileUploadMiddleware');


const {
    searchRequestsForAdmin,
    searchRequestsForPublic,
    getRequestByIdForAdmin,
    getRequestByIdForPublic,
    getMyRequests,
    getMyRequestByID,
    createRequestWithAttachments,
    deleteRequest,
    createOffer,
    deleteOffer,
    acceptOffer,
    submitRequest,
    acceptSubmission,
    rateCustomRequest,
    disputeByProvider,
    disputeByOwner,
} = require('../controllers/customRequest.controller');

const { authorize, authenticate } = require('../middlewares/authMiddleware');


router.get('/search/public', searchRequestsForPublic);
router.get('/:id/public', getRequestByIdForPublic);

router.use(authenticate);

router.get('/search/admin', authorize("show_requests"), searchRequestsForAdmin);
router.get('/:id/admin', authorize("show_requests"), getRequestByIdForAdmin);
router.get('/my', getMyRequests);
router.get('/my/:id', getMyRequestByID);
router.post('/', upload.array('files'), createRequestWithAttachments);
router.delete('/:id', deleteRequest);

router.post('/:id/offers', upload.array('files'), createOffer);
router.delete('/:id/offers/my', deleteOffer);
router.patch('/:id/accept-offer/:offer_id', acceptOffer);

router.patch('/:id/submit', submitRequest);
router.patch('/:id/accept-submission', acceptSubmission);
router.post('/:id/rate', rateCustomRequest);

router.post('/dispute/provider', disputeByProvider);
router.post('/dispute/owner', disputeByOwner);


module.exports = router;
