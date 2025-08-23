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

router.get('/:category_id/users', getAcademicSubcategoriesForPublicByCategoryId);

router.use(authenticate, authorize('manage_academic_categories'));

// Create a new academic subcategory
router.post('/', createAcademicSubcategory);

// Get all academic subcategories (with filters/pagination)
router.get('/', getAllAcademicSubcategories);

// Search academic subcategories
router.get('/search', searchAcademicSubcategories);

// Get all subcategories by category_id (active only)
router.get('/by-category/:category_id', getSubcategoriesByCategory);

// Get a single academic subcategory by ID
router.get('/:id', getAcademicSubcategoryById);

// Update academic subcategory
router.patch('/:id', updateAcademicSubcategory);

// Deactivate academic subcategory (set is_active to false)
router.delete('/:id', deactivateAcademicSubcategory);

// Activate (reactivate) academic subcategory
router.patch('/:id/activate', activateAcademicSubcategory);


module.exports = router;