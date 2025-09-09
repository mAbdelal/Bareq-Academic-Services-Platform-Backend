
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

/**
 * @swagger
 * tags:
 *   - name: Disputes
 *     description: Endpoints for managing disputes
 */

router.use(authenticate);

/**
 * @swagger
 * /disputes/resolve/service-purchase:
 *   post:
 *     summary: Resolve a service purchase dispute (admin)
 *     tags: [Disputes]
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
 *         description: Resolved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/resolve/service-purchase', authorize('resolve_disputes'), adminResolveServicePurchaseDispute);

/**
 * @swagger
 * /disputes/resolve/custom-request:
 *   post:
 *     summary: Resolve a custom request dispute (admin)
 *     tags: [Disputes]
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
 *         description: Resolved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/resolve/custom-request', authorize('resolve_disputes'), adminResolveCustomRequestDispute);

/**
 * @swagger
 * /disputes/search/admin:
 *   get:
 *     summary: Search disputes (admin)
 *     tags: [Disputes]
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
router.get('/search/admin', authorize('resolve_disputes'), searchDisputes); // TODO: make pagination

/**
 * @swagger
 * /disputes/{id}/service-purchase/admin:
 *   get:
 *     summary: Get a service purchase dispute by ID (admin)
 *     tags: [Disputes]
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
router.get('/:id/service-purchase/admin', authorize('resolve_disputes'), getServicePurchaseDisputeByIdForAdmin);

/**
 * @swagger
 * /disputes/{id}/custom-request/admin:
 *   get:
 *     summary: Get a custom request dispute by ID (admin)
 *     tags: [Disputes]
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
router.get('/:id/custom-request/admin', authorize('resolve_disputes'), getCustomRequestDisputeByIdForAdmin);

/**
 * @swagger
 * /disputes/{id}/user:
 *   get:
 *     summary: Get a dispute by ID (user)
 *     tags: [Disputes]
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
router.get('/:id/user', getDisputeByIdForUser);

/**
 * @swagger
 * /disputes/my:
 *   get:
 *     summary: Get my disputes
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 */
router.get('/my', getMyDisputes);

module.exports = router;