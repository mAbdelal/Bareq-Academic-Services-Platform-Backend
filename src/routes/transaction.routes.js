const express = require('express');
const router = express.Router();

const {
    getUserTransactions,
    searchTransactions,
    getMyTransactions
} = require('../controllers/transaction.controller');

const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Transactions
 *     description: Endpoints for viewing transactions
 */

router.use(authenticate);

/**
 * @swagger
 * /transactions/search:
 *   get:
 *     summary: Search transactions (admin)
 *     tags: [Transactions]
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
router.get('/search', authorize('show_transactions'), searchTransactions);

/**
 * @swagger
 * /transactions/my:
 *   get:
 *     summary: Get my transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 */
router.get('/my', getMyTransactions);

/**
 * @swagger
 * /transactions/{user_id}:
 *   get:
 *     summary: Get transactions for a specific user (admin)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
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
router.get('/:user_id', authorize('show_transactions'), getUserTransactions);


module.exports = router;


