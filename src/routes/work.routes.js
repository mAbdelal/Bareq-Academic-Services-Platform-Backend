const express = require('express');
const router = express.Router();
const {
    uploadAttachments,
    getAllWorks,
    getWorkById,
    createWork,
    updateWork,
    deleteWork,
    searchWorks,
    getMyWorks,
    deleteAttachment,
    getUserWorksForPublic } = require('../controllers/work.controller');

const { authenticate, authorize, checkWorkOwnership } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/fileUploadMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Works
 *     description: Endpoints for portfolio works
 */

// Middleware: Allows either admin with permission or the academic user himself
const allowAdminOrSelfWorkOwnership = (permission) => {
    return async (req, res, next) => {
        // Try admin permission first
        authorize(permission)(req, res, (err) => {
            if (!err) return next();
            // If not admin, try self
            checkWorkOwnership(req, res, next);
        });
    };
};

/**
 * @swagger
 * /works:
 *   get:
 *     summary: List all works (admin)
 *     tags: [Works]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticate, authorize('manage_works'), getAllWorks);

/**
 * @swagger
 * /works/search:
 *   get:
 *     summary: Search works (admin)
 *     tags: [Works]
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
router.get('/search', authenticate, authorize('manage_works'), searchWorks);

/**
 * @swagger
 * /works/public/user/{user_id}:
 *   get:
 *     summary: List a user's works (public)
 *     tags: [Works]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/public/user/:user_id', getUserWorksForPublic);

/**
 * @swagger
 * /works/my:
 *   get:
 *     summary: List my works
 *     tags: [Works]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authenticate, getMyWorks);

/**
 * @swagger
 * /works/{id}:
 *   get:
 *     summary: Get work by ID
 *     tags: [Works]
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
router.get('/:id', getWorkById);

/**
 * @swagger
 * /works:
 *   post:
 *     summary: Create a new work
 *     tags: [Works]
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
router.post('/', authenticate, createWork);

/**
 * @swagger
 * /works/{id}/attachments:
 *   post:
 *     summary: Upload work attachments
 *     tags: [Works]
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
 *     responses:
 *       201:
 *         description: Uploaded
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.post('/:id/attachments', authenticate, upload.array('files'), uploadAttachments);

/**
 * @swagger
 * /works/{work_id}/attachments/{attachment_id}:
 *   delete:
 *     summary: Delete a work attachment
 *     tags: [Works]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: work_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: attachment_id
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
router.delete('/:work_id/attachments/:attachment_id', authenticate, deleteAttachment);

/**
 * @swagger
 * /works/{id}:
 *   patch:
 *     summary: Update my work
 *     tags: [Works]
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
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.patch('/:id', authenticate, checkWorkOwnership, updateWork);

/**
 * @swagger
 * /works/{id}:
 *   delete:
 *     summary: Delete my work (admin or owner)
 *     tags: [Works]
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
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete('/:id', authenticate, allowAdminOrSelfWorkOwnership('manage_works'), deleteWork);

module.exports = router;