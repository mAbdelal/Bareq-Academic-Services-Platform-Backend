const express = require('express');
const router = express.Router();

const {
    searchServicesForAdmin,
    createService,
    getServiceByIdForPublic,
    getServiceByIdForAdmin,
    updateService,
    getMyServices,
    toggleOwnerFreeze,
    toggleAdminFreeze,
    deleteServiceAttachment,
    uploadServiceAttachments,
    activateService,
    deactivateService,
    decideServiceApproval,
    searchServicesForPublic,
    getServicesByUserIdForPublic,
    getServicesByUserIdForAdmin,
    getSimilarServicesForPublic,
    getServiceRatings,
    getMyServiceById
} = require('../controllers/services.controller');
const upload = require('../middlewares/fileUploadMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Services
 *     description: Endpoints for services
 */

/**
 * @swagger
 * /services/search/public:
 *   get:
 *     summary: Search services (public)
 *     tags: [Services]
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
router.get('/search/public', searchServicesForPublic);

/**
 * @swagger
 * /services/user/{userId}/public:
 *   get:
 *     summary: List services by user (public)
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/user/:userId/public', getServicesByUserIdForPublic);

/**
 * @swagger
 * /services/{id}/public:
 *   get:
 *     summary: Get service by ID (public)
 *     tags: [Services]
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
router.get('/:id/public', getServiceByIdForPublic);

/**
 * @swagger
 * /services/{id}/public/similar:
 *   get:
 *     summary: Get similar services (public)
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/:id/public/similar', getSimilarServicesForPublic);

/**
 * @swagger
 * /services/{id}/ratings/public:
 *   get:
 *     summary: Get service ratings (public)
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/:id/ratings/public', getServiceRatings);

const { authenticate, authorize, checkServiceOwnership } = require('../middlewares/authMiddleware');
// Middleware: Allows either admin with permission or the academic user himself
const allowAdminOrSelfServiceOwnership = (permission) => {
    return async (req, res, next) => {
        // Try admin permission first
        authorize(permission)(req, res, (err) => {
            if (!err) return next();
            // If not admin, try self
            checkServiceOwnership(req, res, next);
        });
    };
};

router.use(authenticate);

/**
 * @swagger
 * /services/user/{userId}/admin:
 *   get:
 *     summary: List services by user (admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
router.get('/user/:userId/admin', authorize("manage_services"), getServicesByUserIdForAdmin);

/**
 * @swagger
 * /services/search/admin:
 *   get:
 *     summary: Search services (admin)
 *     tags: [Services]
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
router.get('/search/admin', authorize("manage_services"), searchServicesForAdmin);

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
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
router.post('/', createService);

/**
 * @swagger
 * /services/{id}:
 *   patch:
 *     summary: Update my service
 *     tags: [Services]
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
router.patch('/:id', checkServiceOwnership, updateService);

/**
 * @swagger
 * /services/my:
 *   get:
 *     summary: List my services
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 */
router.get('/my', getMyServices);

/**
 * @swagger
 * /services/my/{id}:
 *   get:
 *     summary: Get my service by ID
 *     tags: [Services]
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
router.get("/my/:id", checkServiceOwnership, getMyServiceById);

/**
 * @swagger
 * /services/{id}/toggle-owner-freeze:
 *   patch:
 *     summary: Toggle freeze by owner
 *     tags: [Services]
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
 *         description: Toggled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.patch('/:id/toggle-owner-freeze', checkServiceOwnership, toggleOwnerFreeze);

/**
 * @swagger
 * /services/{id}/toggle-admin-freeze:
 *   patch:
 *     summary: Toggle freeze by admin
 *     tags: [Services]
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
 *         description: Toggled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.patch('/:id/toggle-admin-freeze', authorize("manage_services"), toggleAdminFreeze);

/**
 * @swagger
 * /services/{id}/activate:
 *   patch:
 *     summary: Activate service (admin)
 *     tags: [Services]
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
router.patch('/:id/activate', authorize("manage_services"), activateService);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Deactivate service (admin or owner)
 *     tags: [Services]
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
router.delete('/:id', allowAdminOrSelfServiceOwnership('manage_services'), deactivateService);

/**
 * @swagger
 * /services/{id}/admin-decision:
 *   post:
 *     summary: Admin decision on service approval
 *     tags: [Services]
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
 *               decision:
 *                 type: string
 *                 enum: [approve, reject]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Decision recorded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/:id/admin-decision', authorize("manage_services"), decideServiceApproval);

/**
 * @swagger
 * /services/{id}/attachments:
 *   post:
 *     summary: Upload service attachments
 *     tags: [Services]
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
router.post('/:id/attachments', checkServiceOwnership, upload.array('files'), uploadServiceAttachments);

/**
 * @swagger
 * /services/{id}/attachments/{attachment_id}:
 *   delete:
 *     summary: Delete a service attachment
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
router.delete('/:id/attachments/:attachment_id', checkServiceOwnership, deleteServiceAttachment);

/**
 * @swagger
 * /services/{id}/admin:
 *   get:
 *     summary: Get service by ID (admin)
 *     tags: [Services]
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
router.get('/:id/admin', authorize("manage_services"), getServiceByIdForAdmin);

module.exports = router;