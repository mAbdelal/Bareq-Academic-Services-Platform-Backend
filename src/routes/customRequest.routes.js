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
    getMyOffers
} = require('../controllers/customRequest.controller');

const { authorize, authenticate } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Custom Requests
 *     description: Endpoints for custom service requests and offers
 */

/**
 * @swagger
 * /requests/search/public:
 *   get:
 *     summary: Search custom requests (public)
 *     tags: [Custom Requests]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/search/public', searchRequestsForPublic);

/**
 * @swagger
 * /requests/{id}/public:
 *   get:
 *     summary: Get a custom request by ID (public)
 *     tags: [Custom Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Not found
 */
router.get('/:id/public', getRequestByIdForPublic);

router.use(authenticate);

/**
 * @swagger
 * /requests/search/admin:
 *   get:
 *     summary: Search custom requests (admin)
 *     tags: [Custom Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/search/admin', authorize("show_requests"), searchRequestsForAdmin);

/**
 * @swagger
 * /requests/{id}/admin:
 *   get:
 *     summary: Get a custom request by ID (admin)
 *     tags: [Custom Requests]
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
 *       404:
 *         description: Not found
 */
router.get('/:id/admin', authorize("show_requests"), getRequestByIdForAdmin);

/**
 * @swagger
 * /requests/my:
 *   get:
 *     summary: Get my custom requests
 *     tags: [Custom Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 */
router.get('/my', getMyRequests);

/**
 * @swagger
 * /requests/my/{id}:
 *   get:
 *     summary: Get one of my custom requests by ID
 *     tags: [Custom Requests]
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
 *       404:
 *         description: Not found
 */
router.get('/my/:id', getMyRequestByID);

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a custom request with attachments
 *     tags: [Custom Requests]
 *     security:
 *       - bearerAuth: []
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
 *               data:
 *                 type: string
 *                 description: JSON string with request details
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', upload.array('files'), createRequestWithAttachments);

/**
 * @swagger
 * /requests/{id}:
 *   delete:
 *     summary: Delete a custom request
 *     tags: [Custom Requests]
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
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.delete('/:id', deleteRequest);

/**
 * @swagger
 * /requests/{id}/offers:
 *   post:
 *     summary: Create an offer on a request
 *     tags: [Custom Requests]
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
 *               data:
 *                 type: string
 *                 description: JSON string with offer details
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/offers', upload.array('files'), createOffer);

/**
 * @swagger
 * /requests/{id}/offers/my:
 *   delete:
 *     summary: Delete my offer from a request
 *     tags: [Custom Requests]
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
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.delete('/:id/offers/my', deleteOffer);

/**
 * @swagger
 * /requests/{id}/offers/{offer_id}/accept:
 *   patch:
 *     summary: Accept an offer on my request
 *     tags: [Custom Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: offer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Accepted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.patch('/:id/offers/:offer_id/accept', acceptOffer);

/**
 * @swagger
 * /requests/offers/my:
 *   get:
 *     summary: List my offers
 *     tags: [Custom Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 */
router.get('/offers/my', getMyOffers);

/**
 * @swagger
 * /requests/{id}/submit:
 *   patch:
 *     summary: Submit work for a request
 *     tags: [Custom Requests]
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
 *         description: Submitted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.patch('/:id/submit', submitRequest);

/**
 * @swagger
 * /requests/{id}/accept-submission:
 *   patch:
 *     summary: Accept submitted work
 *     tags: [Custom Requests]
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
 *         description: Accepted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.patch('/:id/accept-submission', acceptSubmission);

/**
 * @swagger
 * /requests/{id}/rate:
 *   post:
 *     summary: Rate a completed custom request
 *     tags: [Custom Requests]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.post('/:id/rate', rateCustomRequest);

/**
 * @swagger
 * /requests/dispute/provider:
 *   post:
 *     summary: Open a dispute (provider)
 *     tags: [Custom Requests]
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
 *         description: Dispute opened
 *       401:
 *         description: Unauthorized
 */
router.post('/dispute/provider', disputeByProvider);

/**
 * @swagger
 * /requests/dispute/owner:
 *   post:
 *     summary: Open a dispute (owner)
 *     tags: [Custom Requests]
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
 *         description: Dispute opened
 *       401:
 *         description: Unauthorized
 */
router.post('/dispute/owner', disputeByOwner);


module.exports = router;
