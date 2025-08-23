const express = require('express');
const router = express.Router();
const {
    uploadAttachments,
    getAllWorks,
    getWorkById,
    createWork,
    updateWork,
    deleteWork,
    searchWorks,
    getMyWorks,
    deleteAttachment,
    getUserWorksForPublic } = require('../controllers/work.controller');

const { authenticate, authorize, checkWorkOwnership } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/fileUploadMiddleware');


// Middleware: Allows either admin with permission or the academic user himself
const allowAdminOrSelfWorkOwnership = (permission) => {
    return async (req, res, next) => {
        // Try admin permission first
        authorize(permission)(req, res, (err) => {
            if (!err) return next();
            // If not admin, try self
            checkWorkOwnership(req, res, next);
        });
    };
};

router.get('/', authenticate, authorize('manage_works'), getAllWorks);

router.get('/search', authenticate, authorize('manage_works'), searchWorks);

router.get('/public/user/:user_id', getUserWorksForPublic);

router.get('/my', authenticate, getMyWorks);

router.get('/:id', getWorkById);

router.post('/', authenticate, createWork);

router.post('/:id/attachments', authenticate, upload.array('files'), uploadAttachments);

router.delete('/:work_id/attachments/:attachment_id', deleteAttachment);

router.patch('/:id', authenticate, checkWorkOwnership, updateWork);

router.delete('/:id', authenticate, allowAdminOrSelfWorkOwnership('manage_works'), deleteWork);

module.exports = router;