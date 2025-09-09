const prisma = require('../config/prisma');
const { success } = require('../utils/response');
const { NotFoundError, BadRequestError } = require('../utils/errors');

const createAcademicCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        const existing = await prisma.academicCategorys.findUnique({ where: { name } });
        if (existing) throw new BadRequestError('Category name already exists');

        const category = await prisma.academicCategorys.create({
            data: {
                name,
                description,
            }
        });

        return success(res, category, 'Academic category created successfully');
    } catch (err) {
        next(err);
    }
};

const getAllAcademicCategories = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const where = {};

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const categories = await prisma.academicCategorys.findMany({
            where,
            skip,
            take: parseInt(limit),
            orderBy: { created_at: 'desc' }
        });

        return success(res, categories);
    } catch (err) {
        next(err);
    }
};

const getAllAcademicCategoriesForPublic = async (req, res, next) => {
    try {
        const categories = await prisma.academicCategorys.findMany({
            where: {
                is_active: true,
            },
            orderBy: {
                created_at: 'desc'
            },
            select: {
                id: true,
                name: true,
            }
        });

        return success(res, categories);
    } catch (err) {
        next(err);
    }
};

const getAcademicCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await prisma.academicCategorys.findUnique({
            where: { id: parseInt(id) },
            select: {
                name: true,
                description: true,
            }
        });

        if (!category) throw new NotFoundError('Academic category not found');

        return success(res, category);
    } catch (err) {
        next(err);
    }
};

const updateAcademicCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const existing = await prisma.academicCategorys.findUnique({ where: { id: parseInt(id) } });
        if (!existing) throw new NotFoundError('Academic category not found');

        // Check for name uniqueness if changed
        if (name && name !== existing.name) {
            const nameExists = await prisma.academicCategorys.findUnique({ where: { name } });
            if (nameExists) throw new BadRequestError('Category name already taken');
        }

        const updated = await prisma.academicCategorys.update({
            where: { id: parseInt(id) },
            data: {
                name: name || undefined,
                description: description || undefined,
                updated_at: new Date()
            }
        });

        return success(res, updated, 'Academic category updated successfully');
    } catch (err) {
        next(err);
    }
};

const deleteAcademicCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await prisma.academicCategorys.findUnique({
            where: { id: parseInt(id) }
        });

        if (!category) {
            throw new NotFoundError('Academic category not found');
        }

        if (!category.is_active) {
            return success(res, null, 'Academic category is already inactive');
        }

        const updated = await prisma.academicCategorys.update({
            where: { id: parseInt(id) },
            data: {
                is_active: false,
                updated_at: new Date()
            }
        });

        return success(res, updated, 'Academic category soft-deleted (marked inactive)');
    } catch (err) {
        next(err);
    }
};

const activateAcademicCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await prisma.academicCategorys.findUnique({
            where: { id: parseInt(id) }
        });

        if (!category) {
            throw new NotFoundError('Academic category not found');
        }

        if (category.is_active) {
            return success(res, null, 'Academic category is already active');
        }

        const updated = await prisma.academicCategorys.update({
            where: { id: parseInt(id) },
            data: {
                is_active: true,
                updated_at: new Date()
            }
        });

        return success(res, updated, 'Academic category activated successfully');
    } catch (err) {
        next(err);
    }
};

const searchAcademicCategories = async (req, res, next) => {
    try {
        const {
            name,
            description,
            is_active,
            page = 1,
            limit = 10
        } = req.query;

        const where = {
            ...(name && {
                name: {
                    contains: name,
                    mode: 'insensitive'
                }
            }),
            ...(description && {
                description: {
                    contains: description,
                    mode: 'insensitive'
                }
            }),
            ...(is_active !== undefined && {
                is_active: is_active === 'true'
            })
        };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const [categories, total] = await Promise.all([
            prisma.academicCategorys.findMany({
                where,
                skip,
                take,
                orderBy: {
                    updated_at: 'desc'
                }
            }),
            prisma.academicCategorys.count({ where })
        ]);

        return success(
            res,
            {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
                data: categories
            },
            'Academic categories fetched'
        );
    } catch (err) {
        next(err);
    }
};




module.exports = {
    createAcademicCategory,
    getAllAcademicCategories,
    getAcademicCategoryById,
    updateAcademicCategory,
    deleteAcademicCategory,
    activateAcademicCategory,
    searchAcademicCategories,
    getAllAcademicCategoriesForPublic
};