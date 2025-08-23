const express = require('express');
const router = express.Router();

const {
    searchServicesForAdmin,
    createService,
    getServiceByIdForPublic,
    getServiceByIdForAdmin,
    updateService,
    getMyServices,
    toggleOwnerFreeze,
    toggleAdminFreeze,
    deleteServiceAttachment,
    uploadServiceAttachments,
    activateService,
    deactivateService,
    approveService,
    searchServicesForPublic,
    getServicesByUserIdForPublic,
    getServicesByUserIdForAdmin
} = require('../controllers/services.controller');
const upload = require('../middlewares/fileUploadMiddleware');
const { authenticate, authorize, checkServiceOwnership } = require('../middlewares/authMiddleware');


// Middleware: Allows either admin with permission or the academic user himself
const allowAdminOrSelfServiceOwnership = (permission) => {
    return async (req, res, next) => {
        // Try admin permission first
        authorize(permission)(req, res, (err) => {
            if (!err) return next();
            // If not admin, try self
            checkServiceOwnership(req, res, next);
        });
    };
};

router.get('/user/:userId/public', getServicesByUserIdForPublic);
router.get('/search/public', searchServicesForPublic);
router.get('/:id/public', getServiceByIdForPublic);

router.use(authenticate);

router.get('/user/:userId/admin', authorize("manage_services"), getServicesByUserIdForAdmin);

router.get('/search/admin', authorize("manage_services"), searchServicesForAdmin);

router.post('/', createService);

router.patch('/:id', checkServiceOwnership, updateService);

router.get('/my', getMyServices);

router.patch('/:id/toggle-owner-freeze', checkServiceOwnership, toggleOwnerFreeze);

router.patch('/:id/toggle-admin-freeze', authorize("manage_services"), toggleAdminFreeze);

router.patch('/:id/activate', authorize("manage_services"), activateService);

router.delete('/:id', allowAdminOrSelfServiceOwnership('manage_services'), deactivateService);

router.post('/:id/approve', authorize("manage_services"), approveService);

router.post('/:id/attachments', checkServiceOwnership, upload.array('files'), uploadServiceAttachments);

router.delete('/:id/attachments/:attachment_id', checkServiceOwnership, deleteServiceAttachment);

router.get('/:id/admin', authorize("manage_services"), getServiceByIdForAdmin);

module.exports = router;