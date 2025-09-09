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

/**
 * @swagger
 * tags:
 *   - name: Purchase Deliverables
 *     description: Endpoints for submitting and reviewing purchase deliverables
 */

router.use(authenticate);

/**
 * @swagger
 * /purchase-deliverables/{purchase_id}:
 *   post:
 *     summary: Submit deliverable files for a purchase
 *     tags: [Purchase Deliverables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: purchase_id
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
 *     responses:
 *       201:
 *         description: Submitted
 *       401:
 *         description: Unauthorized
 */
router.post('/:purchase_id', upload.array('files'), submitDeliverable);

/**
 * @swagger
 * /purchase-deliverables/{id}/accept:
 *   patch:
 *     summary: Accept a deliverable
 *     tags: [Purchase Deliverables]
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
router.patch('/:id/accept', acceptDeliverable);

/**
 * @swagger
 * /purchase-deliverables/{id}/reject:
 *   patch:
 *     summary: Reject a deliverable
 *     tags: [Purchase Deliverables]
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
router.patch('/:id/reject', rejectDeliverable);

/**
 * @swagger
 * /purchase-deliverables/{id}:
 *   delete:
 *     summary: Delete a deliverable
 *     tags: [Purchase Deliverables]
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
router.delete('/:id', deleteDeliverable);

module.exports = router;
