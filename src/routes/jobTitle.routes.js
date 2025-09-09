const express = require('express');
const router = express.Router();
const {
    searchJobTitles,
    createJobTitle,
    getAllJobTitles,
    getJobTitleById,
    updateJobTitle,
    deleteJobTitle,
    incrementJobTitleUsage,
    getJobTitleSuggestions
} = require('../controllers/jobTitle.controller');

const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Job Titles
 *     description: Endpoints for managing job titles
 */

/**
 * @swagger
 * /job-titles/suggestions:
 *   get:
 *     summary: Get job title suggestions (public)
 *     tags: [Job Titles]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/suggestions', getJobTitleSuggestions);

router.use(authenticate, authorize('manage_job_titles'));

/**
 * @swagger
 * /job-titles/search:
 *   get:
 *     summary: Search job titles (admin)
 *     tags: [Job Titles]
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
router.get('/search', searchJobTitles);

/**
 * @swagger
 * /job-titles:
 *   post:
 *     summary: Create a job title (admin)
 *     tags: [Job Titles]
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
router.post('/', createJobTitle);

/**
 * @swagger
 * /job-titles:
 *   get:
 *     summary: List job titles (admin)
 *     tags: [Job Titles]
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
router.get('/', getAllJobTitles);

/**
 * @swagger
 * /job-titles/{id}:
 *   get:
 *     summary: Get job title by ID (admin)
 *     tags: [Job Titles]
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
router.get('/:id', getJobTitleById);

/**
 * @swagger
 * /job-titles/{id}:
 *   put:
 *     summary: Update a job title by ID (admin)
 *     tags: [Job Titles]
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
router.put('/:id', updateJobTitle);

/**
 * @swagger
 * /job-titles/{id}:
 *   delete:
 *     summary: Delete a job title by ID (admin)
 *     tags: [Job Titles]
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
router.delete('/:id', deleteJobTitle);

/**
 * @swagger
 * /job-titles/{id}/increment:
 *   patch:
 *     summary: Increment job title usage (admin)
 *     tags: [Job Titles]
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
 *         description: Incremented
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.patch('/:id/increment', incrementJobTitleUsage);

module.exports = router;
