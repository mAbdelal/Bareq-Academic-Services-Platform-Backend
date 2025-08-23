const express = require('express');
const router = express.Router();
const {
    getSkillSuggestions,
    searchSkills,
    createSkill,
    getAllSkills,
    getSkillById,
    updateSkill,
    deleteSkill,
} = require('../controllers/skill.controller');

const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/suggestions', getSkillSuggestions);

router.use(authenticate, authorize('manage_skills'));

// Search skills with filters and pagination
router.get('/search', searchSkills);

// Create new skill
router.post('/', createSkill);

// Get all skills (paginated)
router.get('/', getAllSkills);

// Get skill by id
router.get('/:id', getSkillById);

// Update skill by id
router.patch('/:id', updateSkill);

// Delete skill by id
router.delete('/:id', deleteSkill);


module.exports = router;
