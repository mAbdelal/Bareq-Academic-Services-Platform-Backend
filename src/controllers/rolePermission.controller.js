const prisma = require('../config/prisma');
const { success } = require('../utils/response');
const {
    BadRequestError,
    NotFoundError,
} = require('../utils/errors'); 

const addPermissionToRole = async (req, res, next) => {
    try {
        const { permission_id, role_id } = req.body;

        const roleId = parseInt(role_id);
        const permissionId = parseInt(permission_id);

        if (isNaN(roleId)) {
            throw new BadRequestError('Invalid role_id');
        }
        if (isNaN(permissionId)) {
            throw new BadRequestError('Invalid permission_id');
        }

        // Check Role Existence
        const role = await prisma.roles.findUnique({ where: { id: roleId } });
        if (!role) {
            throw new NotFoundError(`Role with ID ${roleId} not found`);
        }

        // Check Permission Existence
        const permission = await prisma.permissions.findUnique({ where: { id: permissionId } });
        if (!permission) {
            throw new NotFoundError(`Permission with ID ${permissionId} not found`);
        }

        // Check if already assigned
        const existing = await prisma.rolePermission.findUnique({
            where: {
                role_id_permission_id: {
                    role_id: roleId,
                    permission_id: permissionId
                }
            }
        });

        if (existing) {
            throw new BadRequestError('Permission already assigned to this role');
        }

        // Assign Permission
        const rolePermission = await prisma.rolePermission.create({
            data: {
                role_id: roleId,
                permission_id: permissionId
            }
        });

        return success(res, rolePermission, 'Permission added to role successfully');
    } catch (error) {
        next(error);
    }
};

const removePermissionFromRole = async (req, res, next) => {
    try {
        const { role_id, permission_id } = req.body;

        const roleId = parseInt(role_id);
        const permissionId = parseInt(permission_id);

        if (isNaN(roleId) || isNaN(permissionId)) {
            throw new BadRequestError('Both role_id and permission_id must be valid numbers');
        }

        // Check if the assignment exists
        const existing = await prisma.rolePermission.findUnique({
            where: {
                role_id_permission_id: {
                    role_id: roleId,
                    permission_id: permissionId
                }
            }
        });

        if (!existing) {
            throw new NotFoundError('Permission is not assigned to this role');
        }

        await prisma.rolePermission.delete({
            where: {
                role_id_permission_id: {
                    role_id: roleId,
                    permission_id: permissionId
                }
            }
        });

        return success(res, null, 'Permission removed from role successfully');
    } catch (error) {
        next(error);
    }
};

const getPermissionsForRole = async (req, res, next) => {
    try {
        const { role_id } = req.params;
        const roleId = parseInt(role_id);

        if (isNaN(roleId)) {
            throw new BadRequestError('Invalid role_id');
        }

        const role = await prisma.roles.findUnique({
            where: { id: roleId },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        if (!role) {
            throw new NotFoundError(`Role with ID ${roleId} not found`);
        }

        const permissions = role.permissions.map(p => p.permission);

        return success(res, permissions, 'Permissions fetched successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addPermissionToRole,
    removePermissionFromRole,
    getPermissionsForRole
};
