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

router.get('/suggestions', getJobTitleSuggestions);

router.use(authenticate, authorize('manage_job_titles'));

router.get('/search', searchJobTitles);

router.post('/', createJobTitle);

router.get('/', getAllJobTitles);

router.get('/:id', getJobTitleById);

router.put('/:id', updateJobTitle);

router.delete('/:id', deleteJobTitle);

router.patch('/:id/increment', incrementJobTitleUsage);

module.exports = router;
