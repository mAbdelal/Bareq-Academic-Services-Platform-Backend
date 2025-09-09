const express = require('express');
const router = express.Router();
const {
    createServicePurchase,
    getMyPurchases,
    getPurchaseById,
    providerAcceptPurchase,
    providerRejectPurchase,
    finalSubmission,
    buyerAcceptSubmission,
    buyerRejectSubmission,
    buyerDispute,
    providerDispute,
    getAllPurchasesForAdmin,
    rateService
} = require('../controllers/servicePurchase.controller');

const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Service Purchases
 *     description: Endpoints for buying services and handling submissions/disputes
 */

router.use(authenticate);

/**
 * @swagger
 * /purchases/admin/{service_id}:
 *   get:
 *     summary: List all purchases for a service (admin)
 *     tags: [Service Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: service_id
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
router.get('/admin/:service_id', authorize("show_purchases"), getAllPurchasesForAdmin);

// Buyer Routes
/**
 * @swagger
 * /purchases:
 *   post:
 *     summary: Create a service purchase (buyer)
 *     tags: [Service Purchases]
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
 *         description: Created
 *       401:
 *         description: Unauthorized
 */
router.post('/', createServicePurchase);

/**
 * @swagger
 * /purchases/my:
 *   get:
 *     summary: List my purchases (buyer)
 *     tags: [Service Purchases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 */
router.get('/my', getMyPurchases);

/**
 * @swagger
 * /purchases/{id}:
 *   get:
 *     summary: Get purchase by ID
 *     tags: [Service Purchases]
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
router.get('/:id', getPurchaseById);

// Provider Routes
/**
 * @swagger
 * /purchases/{id}/accept:
 *   patch:
 *     summary: Provider accepts purchase
 *     tags: [Service Purchases]
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
router.patch('/:id/accept', providerAcceptPurchase);

/**
 * @swagger
 * /purchases/{id}/reject:
 *   patch:
 *     summary: Provider rejects purchase
 *     tags: [Service Purchases]
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
 *         description: Rejected
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.patch('/:id/reject', providerRejectPurchase);

/**
 * @swagger
 * /purchases/{id}/submit:
 *   patch:
 *     summary: Provider submits final work
 *     tags: [Service Purchases]
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
router.patch('/:id/submit', finalSubmission);

/**
 * @swagger
 * /purchases/dispute/provider:
 *   post:
 *     summary: Provider opens a dispute
 *     tags: [Service Purchases]
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
router.post('/dispute/provider', providerDispute);

// Buyer Routes 
/**
 * @swagger
 * /purchases/{id}/accept-submission:
 *   patch:
 *     summary: Buyer accepts submission
 *     tags: [Service Purchases]
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
router.patch('/:id/accept-submission', buyerAcceptSubmission);

/**
 * @swagger
 * /purchases/{id}/reject-submission:
 *   patch:
 *     summary: Buyer rejects submission
 *     tags: [Service Purchases]
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
 *         description: Rejected
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.patch('/:id/reject-submission', buyerRejectSubmission);

/**
 * @swagger
 * /purchases/dispute/buyer:
 *   post:
 *     summary: Buyer opens a dispute
 *     tags: [Service Purchases]
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
router.post('/dispute/buyer', buyerDispute);

/**
 * @swagger
 * /purchases/{id}/rate:
 *   post:
 *     summary: Rate a purchased service
 *     tags: [Service Purchases]
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
router.post('/:id/rate', rateService);

module.exports = router;
