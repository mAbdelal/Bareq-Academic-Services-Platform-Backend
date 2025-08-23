const express = require('express');
const router = express.Router();
const {
    login,
    refreshToken,
    forgotPassword,
    resetPassword,
    changePassword,
    checkUsernameAvailability,
    registerAcademicUser,
    registerAdminUser
} = require('../controllers/auth.controller');
const { authenticate,authorize } = require('../middlewares/authMiddleware');

router.post('/login', login);

router.post('/refresh-token', refreshToken);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);

router.post('/change-password', authenticate, changePassword);

router.get('/check-username/:username', checkUsernameAvailability);

router.post('/register-academic', registerAcademicUser);

router.post('/register-admin', authenticate, authorize("manage_admins"),registerAdminUser);



module.exports = router;