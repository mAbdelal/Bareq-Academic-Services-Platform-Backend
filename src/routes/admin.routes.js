const express = require('express');
const router = express.Router();
const {
    getAllAdmins,
    getAdminById,
    updateAdminRole,
    softDeleteAdmin,
    updateAdminUserInfo,
    activateAdmin,
    getAdminProfile,
    searchAdmins
} = require('../controllers/admin.controller');
const { authenticate, authorize, isSelfAdmin, protectSuperAdminTarget } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Admins
 *     description: Endpoints for managing admin users
 */

router.use(authenticate);

// Update admin user info
/**
 * @swagger
 * /admins/{id}:
 *   patch:
 *     summary: Update admin user info
 *     tags: [Admins]
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
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.patch(
    '/:id',
    protectSuperAdminTarget(true), // Step 1: Ensure target is not SuperAdmin

    // Step 2: Check if user has manage_admins or is the same admin
    async (req, res, next) => {
        try {
            await authorize('manage_admins')(req, res, async (err) => {
                if (!err) return next(); // has permission
                // fallback to isSelfAdmin
                isSelfAdmin(req, res, next);
            });
        } catch (error) {
            next(error);
        }
    },

    updateAdminUserInfo
);

// Search admins
/**
 * @swagger
 * /admins/search:
 *   get:
 *     summary: Search admins
 *     tags: [Admins]
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
router.get('/search', authorize('manage_admins'), searchAdmins);

// Get all admins
/**
 * @swagger
 * /admins:
 *   get:
 *     summary: List admins
 *     tags: [Admins]
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
router.get('/', authorize('manage_admins'), getAllAdmins);

// Get admin by user ID
/**
 * @swagger
 * /admins/{id}:
 *   get:
 *     summary: Get admin by ID
 *     tags: [Admins]
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
router.get('/:id', authorize('manage_admins'), getAdminById);

// Update admin role
/**
 * @swagger
 * /admins/{id}/role:
 *   patch:
 *     summary: Update admin role
 *     tags: [Admins]
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
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.patch('/:id/role', protectSuperAdminTarget(false), authorize('manage_admins'), updateAdminRole);

// Soft delete (deactivate) admin
/**
 * @swagger
 * /admins/{id}:
 *   delete:
 *     summary: Deactivate admin
 *     tags: [Admins]
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
 *         description: Deactivated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete('/:id', protectSuperAdminTarget(false), authorize('manage_admins'), softDeleteAdmin);

// Activate admin
/**
 * @swagger
 * /admins/{id}/activate:
 *   patch:
 *     summary: Activate admin
 *     tags: [Admins]
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
 *         description: Activated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.patch('/:id/activate', protectSuperAdminTarget(false), authorize('manage_admins'), activateAdmin);

// Get own admin profile
/**
 * @swagger
 * /admins/me/profile:
 *   get:
 *     summary: Get my admin profile
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 */
router.get('/me/profile', getAdminProfile);






module.exports = router;