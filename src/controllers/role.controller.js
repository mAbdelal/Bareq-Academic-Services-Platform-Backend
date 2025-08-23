const prisma = require('../config/prisma');
const { success } = require('../utils/response');
const { BadRequestError, NotFoundError } = require('../utils/errors');

const createRole = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        const existing = await prisma.roles.findUnique({ where: { name } });
        if (existing) throw new BadRequestError('Role with this name already exists');

        const role = await prisma.roles.create({ data: { name, description } });
        return success(res, role, 'Role created successfully');
    } catch (err) {
        next(err);
    }
};


const getAllRoles = async (req, res, next) => {
    try {
        const roles = await prisma.roles.findMany();
        return success(res, roles, 'Roles fetched successfully');
    } catch (err) {
        next(err);
    }
};

const getRoleById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const role = await prisma.roles.findUnique({
            where: { id: parseInt(id) },
        });

        if (!role) throw new NotFoundError('Role not found');

        return success(res, role, 'Role fetched successfully');
    } catch (err) {
        next(err);
    }
};

const updateRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { description } = req.body;

        const role = await prisma.roles.findUnique({ where: { id: parseInt(id) } });
        if (!role) throw new NotFoundError('Role not found');

        const updated = await prisma.roles.update({
            where: { id: parseInt(id) },
            data: { description, updated_at: new Date() }
        });

        return success(res, updated, 'Role updated successfully');
    } catch (err) {
        next(err);
    }
};

const deleteRole = async (req, res, next) => {
    try {
        const { id } = req.params;

        const role = await prisma.roles.findUnique({ where: { id: parseInt(id) } });
        if (!role) throw new NotFoundError('Role not found');

        await prisma.roles.delete({ where: { id: parseInt(id) } });
        return success(res, {}, 'Role deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
};
