const express = require('express');
const router = express.Router();
const {
    getAllAdmins,
    getAdminById,
    updateAdminRole,
    softDeleteAdmin,
    updateAdminUserInfo,
    activateAdmin,
    getAdminProfile,
    searchAdmins
} = require('../controllers/admin.controller');
const { authenticate, authorize, isSelfAdmin, protectSuperAdminTarget } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Update admin user info
router.patch(
    '/:id',
    protectSuperAdminTarget(true), // Step 1: Ensure target is not SuperAdmin

    // Step 2: Check if user has manage_admins or is the same admin
    async (req, res, next) => {
        try {
            await authorize('manage_admins')(req, res, async (err) => {
                if (!err) return next(); // has permission
                // fallback to isSelfAdmin
                isSelfAdmin(req, res, next);
            });
        } catch (error) {
            next(error);
        }
    },

    updateAdminUserInfo
);

// Search admins
router.get('/search', authorize('manage_admins'), searchAdmins);

// Get all admins
router.get('/', authorize('manage_admins'), getAllAdmins);

// Get admin by user ID
router.get('/:id', authorize('manage_admins'), getAdminById);

// Update admin role
router.patch('/:id/role', protectSuperAdminTarget(false), authorize('manage_admins'), updateAdminRole);

// Soft delete (deactivate) admin
router.delete('/:id', protectSuperAdminTarget(false), authorize('manage_admins'), softDeleteAdmin);

// Activate admin
router.patch('/:id/activate', protectSuperAdminTarget(false), authorize('manage_admins'), activateAdmin);

// Get own admin profile
router.get('/me/profile', getAdminProfile);





module.exports = router;