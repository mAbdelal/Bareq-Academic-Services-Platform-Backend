const express = require('express');
const router = express.Router();
const {
    createAcademicCategory,
    getAllAcademicCategories,
    getAcademicCategoryById,
    updateAcademicCategory,
    deleteAcademicCategory,
    activateAcademicCategory,
    searchAcademicCategories,
    getAllAcademicCategoriesForPublic
} = require('../controllers/academicCategory.controller');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Academic Categories
 *     description: Endpoints for managing academic categories
 */


/**
 * @swagger
 * /academic-categories/public:
 *   get:
 *     summary: List academic categories (public)
 *     tags: [Academic Categories]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/public', getAllAcademicCategoriesForPublic);

router.use(authenticate, authorize('manage_academic_categories'));

/**
 * @swagger
 * /academic-categories:
 *   post:
 *     summary: Create an academic category
 *     tags: [Academic Categories]
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
 *       403:
 *         description: Forbidden
 */
router.post('/', createAcademicCategory);

/**
 * @swagger
 * /academic-categories:
 *   get:
 *     summary: List academic categories (admin)
 *     tags: [Academic Categories]
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
router.get('/', getAllAcademicCategories);

/**
 * @swagger
 * /academic-categories/search:
 *   get:
 *     summary: Search academic categories
 *     tags: [Academic Categories]
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
router.get('/search', searchAcademicCategories);

/**
 * @swagger
 * /academic-categories/{id}:
 *   get:
 *     summary: Get academic category by ID
 *     tags: [Academic Categories]
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
router.get('/:id', getAcademicCategoryById);

/**
 * @swagger
 * /academic-categories/{id}:
 *   patch:
 *     summary: Update academic category by ID
 *     tags: [Academic Categories]
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
router.patch('/:id', updateAcademicCategory);

/**
 * @swagger
 * /academic-categories/{id}:
 *   delete:
 *     summary: Delete academic category by ID
 *     tags: [Academic Categories]
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
router.delete('/:id', deleteAcademicCategory);

/**
 * @swagger
 * /academic-categories/{id}/activate:
 *   patch:
 *     summary: Activate academic category by ID
 *     tags: [Academic Categories]
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
router.patch('/:id/activate', activateAcademicCategory);

module.exports = router;