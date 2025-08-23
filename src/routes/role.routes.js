const express = require('express');
const router = express.Router();

const {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
} = require('../controllers/role.controller');

const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);
router.use(authorize("manage_roles"));

router.post('/', createRole);

router.get('/', getAllRoles);

router.get('/:id', getRoleById);

router.patch('/:id', updateRole);

router.delete('/:id', deleteRole);


module.exports = router;
