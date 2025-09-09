const express = require('express');
const router = express.Router();
const {
    createDeliverableWithAttachments,
    acceptDeliverable,
    rejectDeliverable,
} = require('../controllers/requestDeliverable.controller');

const upload = require('../middlewares/fileUploadMiddleware');
const { authenticate } = require('../middlewares/authMiddleware');
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Request Deliverables
 *     description: Endpoints for submitting and reviewing request deliverables
 */

/**
 * @swagger
 * /request-deliverables:
 *   post:
 *     summary: Submit deliverable files for a custom request
 *     tags: [Request Deliverables]
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
 *     responses:
 *       201:
 *         description: Submitted
 *       401:
 *         description: Unauthorized
 */
router.post('/', upload.array('files'), createDeliverableWithAttachments);

/**
 * @swagger
 * /request-deliverables/{id}/accept:
 *   patch:
 *     summary: Accept a deliverable
 *     tags: [Request Deliverables]
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
 * /request-deliverables/{id}/reject:
 *   patch:
 *     summary: Reject a deliverable
 *     tags: [Request Deliverables]
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


module.exports = router;
