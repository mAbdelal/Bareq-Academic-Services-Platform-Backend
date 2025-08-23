const express = require('express');
const router = express.Router();
const {
    getAllAcademicUsers,
    getAcademicUserById,
    updateAcademicUser,
    deactivateAcademicUser,
    activateAcademicUser,
    searchAcademicUsers,
    uploadIdentityDocument,
    getSelfAcademicUserProfile,
    getAllAcademicUsersForPublic,
    getProfileForPublic,
    getMyBalance,
    getUserBalanceByAdmin
} = require('../controllers/academicUser.controller');
const { authenticate, authorize, isSelfAcademicUser } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/fileUploadMiddleware');


router.get('/public', getAllAcademicUsersForPublic);
router.get('/public/:id/profile', getProfileForPublic);

router.use(authenticate);

router.get('/search', authorize('manage_academic_users'), searchAcademicUsers);

router.get('/', authorize('manage_academic_users'), getAllAcademicUsers);

router.get("/:id/balance", authorize('show_users_balances'), getUserBalanceByAdmin);

router.get('/:id', authorize('manage_academic_users'), getAcademicUserById);

router.patch('/:id', isSelfAcademicUser, updateAcademicUser);

router.delete('/:id', authorize('manage_academic_users'), deactivateAcademicUser);

router.patch('/:id/activate', authorize('manage_academic_users'), activateAcademicUser);

router.post('/:id/identity-document', isSelfAcademicUser, upload.single('identity_document'), uploadIdentityDocument);

router.get('/me/profile', getSelfAcademicUserProfile);

router.get("/my/balance", getMyBalance);



module.exports = router