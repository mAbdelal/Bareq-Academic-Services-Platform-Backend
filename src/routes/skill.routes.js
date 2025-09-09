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

/**
 * @swagger
 * tags:
 *   - name: Skills
 *     description: Endpoints for managing skills
 */

/**
 * @swagger
 * /skills/suggestions:
 *   get:
 *     summary: Get skill suggestions (public)
 *     tags: [Skills]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/suggestions', getSkillSuggestions);

router.use(authenticate, authorize('manage_skills'));

// Search skills with filters and pagination
/**
 * @swagger
 * /skills/search:
 *   get:
 *     summary: Search skills (admin)
 *     tags: [Skills]
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
router.get('/search', searchSkills);

// Create new skill
/**
 * @swagger
 * /skills:
 *   post:
 *     summary: Create a new skill (admin)
 *     tags: [Skills]
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
router.post('/', createSkill);

// Get all skills (paginated)
/**
 * @swagger
 * /skills:
 *   get:
 *     summary: List all skills (admin)
 *     tags: [Skills]
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
router.get('/', getAllSkills);

// Get skill by id
/**
 * @swagger
 * /skills/{id}:
 *   get:
 *     summary: Get a skill by ID (admin)
 *     tags: [Skills]
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
router.get('/:id', getSkillById);

// Update skill by id
/**
 * @swagger
 * /skills/{id}:
 *   patch:
 *     summary: Update a skill by ID (admin)
 *     tags: [Skills]
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
router.patch('/:id', updateSkill);

// Delete skill by id
/**
 * @swagger
 * /skills/{id}:
 *   delete:
 *     summary: Delete a skill by ID (admin)
 *     tags: [Skills]
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
router.delete('/:id', deleteSkill);


module.exports = router;
