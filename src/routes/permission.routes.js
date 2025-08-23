const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const { createPermission, 
    getAllPermissions, 
    getPermissionById, 
    updatePermission, 
    deletePermission, } = require('../controllers/permission.controller');


router.use(authenticate);
router.use(authorize("manage_permissions"));

router.post('/', createPermission);

router.get('/', getAllPermissions);

router.get('/:id', getPermissionById);

router.patch('/:id', updatePermission);

router.delete('/:id', deletePermission);


module.exports = router;
