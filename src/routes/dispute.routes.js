
const express = require('express');
const router = express.Router();

const {
    getMyDisputes,
    searchDisputes,
    getDisputeById,
    adminResolveServicePurchaseDispute,
    adminResolveCustomRequestDispute
} = require("../controllers/dispute.controller")

const { authorize, authenticate } = require('../middlewares/authMiddleware');
const { UnauthorizedError } = require('../utils/errors');


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


/**
 * @swagger
 * /disputes/{id}/user:
 *   get:
 *     summary: Get a dispute by ID 
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
router.get('/:id', async (req, res, next) => {
    await authorize('resolve_disputes')(req, res, async (err) => {
        req.hasPermission = false;
        if (!err) {
            req.hasPermission = true;
        }
        return next();
    });
}
    , getDisputeById);

module.exports = router;