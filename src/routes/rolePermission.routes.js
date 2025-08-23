const express = require('express');
const router = express.Router();
const { addPermissionToRole, removePermissionFromRole, getPermissionsForRole } = require('../controllers/rolePermission.controller');

const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);
router.use(authorize("manage_role_permissions"));

router.post('/assign', addPermissionToRole);

router.post('/remove', removePermissionFromRole);

router.get('/role/:role_id', getPermissionsForRole);

module.exports = router;
