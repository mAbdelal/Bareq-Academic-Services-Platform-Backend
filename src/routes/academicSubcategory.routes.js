const express = require('express');
const router = express.Router();
const {
    createAcademicSubcategory,
    getAllAcademicSubcategories,
    getAcademicSubcategoryById,
    updateAcademicSubcategory,
    deactivateAcademicSubcategory,
    activateAcademicSubcategory,
    searchAcademicSubcategories,
    getSubcategoriesByCategory,
    getAcademicSubcategoriesForPublicByCategoryId
} = require('../controllers/academicSubcategory.controller');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Academic Subcategories
 *     description: Endpoints for managing academic subcategories
 */

router.get('/:category_id/public', getAcademicSubcategoriesForPublicByCategoryId);

router.use(authenticate, authorize('manage_academic_categories'));

// Create a new academic subcategory
/**
 * @swagger
 * /academic-subcategories:
 *   post:
 *     summary: Create an academic subcategory
 *     tags: [Academic Subcategories]
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
router.post('/', createAcademicSubcategory);

// Get all academic subcategories (with filters/pagination)
/**
 * @swagger
 * /academic-subcategories:
 *   get:
 *     summary: List academic subcategories
 *     tags: [Academic Subcategories]
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
router.get('/', getAllAcademicSubcategories);

// Search academic subcategories
/**
 * @swagger
 * /academic-subcategories/search:
 *   get:
 *     summary: Search academic subcategories
 *     tags: [Academic Subcategories]
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
router.get('/search', searchAcademicSubcategories);

// Get all subcategories by category_id (active only)
/**
 * @swagger
 * /academic-subcategories/by-category/{category_id}:
 *   get:
 *     summary: List subcategories for a category
 *     tags: [Academic Subcategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/by-category/:category_id', getSubcategoriesByCategory);

// Get a single academic subcategory by ID
/**
 * @swagger
 * /academic-subcategories/{id}:
 *   get:
 *     summary: Get academic subcategory by ID
 *     tags: [Academic Subcategories]
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
router.get('/:id', getAcademicSubcategoryById);

// Update academic subcategory
/**
 * @swagger
 * /academic-subcategories/{id}:
 *   patch:
 *     summary: Update academic subcategory by ID
 *     tags: [Academic Subcategories]
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
router.patch('/:id', updateAcademicSubcategory);

// Deactivate academic subcategory (set is_active to false)
/**
 * @swagger
 * /academic-subcategories/{id}:
 *   delete:
 *     summary: Deactivate academic subcategory
 *     tags: [Academic Subcategories]
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
router.delete('/:id', deactivateAcademicSubcategory);

// Activate (reactivate) academic subcategory
/**
 * @swagger
 * /academic-subcategories/{id}/activate:
 *   patch:
 *     summary: Activate academic subcategory
 *     tags: [Academic Subcategories]
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
router.patch('/:id/activate', activateAcademicSubcategory);


module.exports = router;