const express = require('express');
const router = express.Router();
const { addPermissionToRole, removePermissionFromRole, getPermissionsForRole } = require('../controllers/rolePermission.controller');

const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Role Permissions
 *     description: Endpoints for managing role permissions
 */

router.use(authenticate);
router.use(authorize("manage_role_permissions"));

/**
 * @swagger
 * /role-permissions/assign:
 *   post:
 *     summary: Assign a permission to a role
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: string
 *               permissionId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Assigned
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/assign', addPermissionToRole);

/**
 * @swagger
 * /role-permissions/remove:
 *   post:
 *     summary: Remove a permission from a role
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: string
 *               permissionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Removed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/remove', removePermissionFromRole);

/**
 * @swagger
 * /role-permissions/role/{role_id}:
 *   get:
 *     summary: Get permissions assigned to a role
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role_id
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
router.get('/role/:role_id', getPermissionsForRole);

module.exports = router;
