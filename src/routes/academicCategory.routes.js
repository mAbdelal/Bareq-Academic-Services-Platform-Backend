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


router.get('/public', getAllAcademicCategoriesForPublic);

router.use(authenticate, authorize('manage_academic_categories'));

// Create a new academic category
router.post('/', createAcademicCategory);

// Get all academic categories (with filters/pagination)
router.get('/', getAllAcademicCategories);

// Search academic categories
router.get('/search', searchAcademicCategories);

// Get a single academic category by ID
router.get('/:id', getAcademicCategoryById);

// Update academic category
router.patch('/:id', updateAcademicCategory);

// Soft delete academic category (set is_active to false)
router.delete('/:id', deleteAcademicCategory);

// Activate (reactivate) academic category
router.patch('/:id/activate', activateAcademicCategory);

module.exports = router;