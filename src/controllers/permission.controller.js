const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { success } = require('../utils/response');
const { BadRequestError, NotFoundError } = require('../utils/errors');

const createPermission = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            throw new BadRequestError('Permission name is required');
        }

        const permission = await prisma.permissions.create({
            data: { name, description },
        });

        return success(res, permission, 'Permission created successfully');
    } catch (err) {
        next(err);
    }
};

const getAllPermissions = async (req, res, next) => {
    try {
        const permissions = await prisma.permissions.findMany();
        return success(res, permissions, 'Permissions retrieved successfully');
    } catch (err) {
        next(err);
    }
};

const getPermissionById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const permission = await prisma.permissions.findUnique({
            where: { id: parseInt(id) },
        });

        if (!permission) {
            throw new NotFoundError(`Permission with ID ${id} not found`);
        }

        return success(res, permission, 'Permission retrieved successfully');
    } catch (err) {
        next(err);
    }
};

const updatePermission = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { description } = req.body;

        const existing = await prisma.permissions.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existing) {
            throw new NotFoundError(`Permission with ID ${id} not found`);
        }

        const updated = await prisma.permissions.update({
            where: { id: parseInt(id) },
            data: {
                description: description ?? existing.description,
                updated_at: new Date(),
            },
        });

        return success(res, updated, 'Permission updated successfully');
    } catch (err) {
        next(err);
    }
};

const deletePermission = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await prisma.permissions.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existing) {
            throw new NotFoundError(`Permission with ID ${id} not found`);
        }

        await prisma.permissions.delete({
            where: { id: parseInt(id) },
        });

        return success(res, {}, 'Permission deleted successfully');
    } catch (err) {
        next(err);
    }
};

const getPermissionRoles = async (req, res, next) => {
    try {
        const { permission_id } = req.params;

        const permission = await prisma.permissions.findUnique({
            where: { id: parseInt(permission_id) },
            include: {
                roles: true,
            },
        });

        if (!permission) {
            throw new NotFoundError(`Permission with ID ${permission_id} not found`);
        }

        return success(res, permission.roles, 'Roles for permission retrieved');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createPermission,
    getAllPermissions,
    getPermissionById,
    updatePermission,
    deletePermission,
    getPermissionRoles,
};
