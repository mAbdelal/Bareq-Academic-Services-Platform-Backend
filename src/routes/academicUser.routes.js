const express = require('express');
const router = express.Router();
const {
    getAllAcademicUsers,
    getAcademicUserById,
    updateAcademicUser,
    deactivateAcademicUser,
    activateAcademicUser,
    searchAcademicUsers,
    searchAcademicUsersPublic,
    uploadIdentityDocument,
    getSelfAcademicUserProfile,
    getAllAcademicUsersForPublic,
    getProfileForPublic,
    getMyBalance,
    getUserBalanceByAdmin,
    getUserRatingPublic
} = require('../controllers/academicUser.controller');
const { authenticate, authorize, isSelfAcademicUser } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/fileUploadMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Academic Users
 *     description: Endpoints related to academic users
 */

/**
 * @swagger
 * /academic-users/public:
 *   get:
 *     summary: List academic users (public)
 *     description: Retrieve a public list of academic users.
 *     tags: [Academic Users]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/public', getAllAcademicUsersForPublic);

/**
 * @swagger
 * /academic-users/public/search:
 *   get:
 *     summary: Search academic users (public)
 *     description: Public search for academic users.
 *     tags: [Academic Users]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Free-text search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page size
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/public/search', searchAcademicUsersPublic);

/**
 * @swagger
 * /academic-users/public/{id}/profile:
 *   get:
 *     summary: Get academic user profile (public)
 *     tags: [Academic Users]
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
router.get('/public/:id/profile', getProfileForPublic);

/**
 * @swagger
 * /academic-users/public/{id}/rating:
 *   get:
 *     summary: Get academic user rating (public)
 *     tags: [Academic Users]
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
router.get('/public/:id/rating', getUserRatingPublic);

router.use(authenticate);

/**
 * @swagger
 * /academic-users/search:
 *   get:
 *     summary: Search academic users (admin)
 *     description: Search among academic users. Requires appropriate permission.
 *     tags: [Academic Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Free-text search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/search', authorize('manage_academic_users'), searchAcademicUsers);

/**
 * @swagger
 * /academic-users:
 *   get:
 *     summary: List academic users (admin)
 *     tags: [Academic Users]
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
router.get('/', authorize('manage_academic_users'), getAllAcademicUsers);

/**
 * @swagger
 * /academic-users/{id}/balance:
 *   get:
 *     summary: Get user balance (admin)
 *     tags: [Academic Users]
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
router.get("/:id/balance", authorize('show_users_balances'), getUserBalanceByAdmin);

/**
 * @swagger
 * /academic-users/{id}:
 *   get:
 *     summary: Get academic user by ID (admin)
 *     tags: [Academic Users]
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
router.get('/:id', authorize('manage_academic_users'), getAcademicUserById);

/**
 * @swagger
 * /academic-users/{id}:
 *   patch:
 *     summary: Update own academic profile
 *     description: Update the authenticated academic user's profile.
 *     tags: [Academic Users]
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
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.patch('/:id', isSelfAcademicUser, updateAcademicUser);

/**
 * @swagger
 * /academic-users/{id}:
 *   delete:
 *     summary: Deactivate academic user (admin)
 *     tags: [Academic Users]
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
router.delete('/:id', authorize('manage_academic_users'), deactivateAcademicUser);

/**
 * @swagger
 * /academic-users/{id}/activate:
 *   patch:
 *     summary: Activate academic user (admin)
 *     tags: [Academic Users]
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
router.patch('/:id/activate', authorize('manage_academic_users'), activateAcademicUser);

/**
 * @swagger
 * /academic-users/{id}/identity-document:
 *   post:
 *     summary: Upload identity document
 *     description: Upload an identity document file for the authenticated academic user.
 *     tags: [Academic Users]
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
 *               identity_document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Uploaded
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.post('/:id/identity-document', isSelfAcademicUser, upload.single('identity_document'), uploadIdentityDocument);

/**
 * @swagger
 * /academic-users/me/profile:
 *   get:
 *     summary: Get my profile
 *     tags: [Academic Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 */
router.get('/me/profile', getSelfAcademicUserProfile);

/**
 * @swagger
 * /academic-users/my/balance:
 *   get:
 *     summary: Get my balance
 *     tags: [Academic Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 */
router.get("/my/balance", getMyBalance);



module.exports = router