const prisma = require('../config/prisma');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { success } = require('../utils/response');

const searchAcademicSubcategories = async (req, res, next) => {
    try {
        const {
            name = '',
            description = '',
            is_active,
            category_id,
            page = 1,
            limit = 10
        } = req.query;

        const where = {
            AND: [
                {
                    name: {
                        contains: name,
                        mode: 'insensitive'
                    }
                },
                {
                    description: {
                        contains: description,
                        mode: 'insensitive'
                    }
                },
                ...(is_active !== undefined
                    ? [{ is_active: is_active === 'true' }]
                    : []),
                ...(category_id
                    ? [{ category_id: parseInt(category_id) }]
                    : [])
            ]
        };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const [data, total] = await Promise.all([
            prisma.academicSubcategorys.findMany({
                where,
                skip,
                take,
                orderBy: { updated_at: 'desc' },
                include: { category: true }
            }),
            prisma.academicSubcategorys.count({ where })
        ]);

        return success(res, {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
            data
        }, 'Academic subcategories search results');
    } catch (err) {
        next(err);
    }
};

const createAcademicSubcategory = async (req, res, next) => {
    try {
        const { category_id, name, description } = req.body;

        const category = await prisma.academicCategorys.findUnique({ where: { id: category_id } });
        if (!category) throw new NotFoundError('Academic category not found');

        const existing = await prisma.academicSubcategorys.findFirst({
            where: { category_id, name }
        });
        if (existing) throw new BadRequestError('Subcategory name already exists in this category');

        const subcategory = await prisma.academicSubcategorys.create({
            data: { category_id, name, description }
        });

        return success(res, subcategory, 'Academic subcategory created successfully');
    } catch (err) {
        next(err);
    }
};

const getAllAcademicSubcategories = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const [data, total] = await Promise.all([
            prisma.academicSubcategorys.findMany({
                skip,
                take,
                orderBy: { updated_at: 'desc' },
                include: { category: true } 
            }),
            prisma.academicSubcategorys.count()
        ]);

        return success(res, {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
            data
        }, 'Academic subcategories retrieved successfully');
    } catch (err) {
        next(err);
    }
};


const getAcademicSubcategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const subcategory = await prisma.academicSubcategorys.findUnique({
            where: { id: parseInt(id) },
            include: { category: true }
        });

        if (!subcategory) throw new NotFoundError('Academic subcategory not found');

        return success(res, subcategory, 'Academic subcategory retrieved successfully');
    } catch (err) {
        next(err);
    }
};

const updateAcademicSubcategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, category_id } = req.body;

        const subcategory = await prisma.academicSubcategorys.findUnique({
            where: { id: parseInt(id) }
        });

        if (!subcategory) throw new NotFoundError('Academic subcategory not found');

        if (name && category_id) {
            const duplicate = await prisma.academicSubcategorys.findFirst({
                where: {
                    id: { not: parseInt(id) },
                    category_id,
                    name
                }
            });
            if (duplicate) throw new BadRequestError('Subcategory name already exists in this category');
        }

        const updated = await prisma.academicSubcategorys.update({
            where: { id: parseInt(id) },
            data: {
                name: name || undefined,
                description: description || undefined,
                category_id: category_id || undefined,
                updated_at: new Date()
            }
        });

        return success(res, updated, 'Academic subcategory updated successfully');
    } catch (err) {
        next(err);
    }
};

const deactivateAcademicSubcategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const subcategory = await prisma.academicSubcategorys.findUnique({
            where: { id: parseInt(id) }
        });

        if (!subcategory) {
            throw new NotFoundError('Academic subcategory not found');
        }

        if (!subcategory.is_active) {
            return success(res, null, 'Academic subcategory is already deactivated');
        }

        await prisma.academicSubcategorys.update({
            where: { id: parseInt(id) },
            data: {
                is_active: false,
                updated_at: new Date()
            }
        });

        return success(res, null, 'Academic subcategory deactivated successfully');
    } catch (err) {
        next(err);
    }
};


const activateAcademicSubcategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const subcategory = await prisma.academicSubcategorys.findUnique({
            where: { id: parseInt(id) }
        });

        if (!subcategory) {
            throw new NotFoundError('Academic subcategory not found');
        }

        if (subcategory.is_active) {
            return success(res, null, 'Academic subcategory is already active');
        }

        await prisma.academicSubcategorys.update({
            where: { id: parseInt(id) },
            data: {
                is_active: true,
                updated_at: new Date()
            }
        });

        return success(res, null, 'Academic subcategory activated successfully');
    } catch (err) {
        next(err);
    }
};

const getSubcategoriesByCategory = async (req, res, next) => {
    try {
        const { category_id } = req.params;
        if (!category_id) return next(new BadRequestError('category_id is required'));

        const subcategories = await prisma.academicSubcategorys.findMany({
            where: {
                category_id: parseInt(category_id),
                is_active: true
            },
            orderBy: { name: 'asc' }
        });

        return success(res, subcategories, 'Academic subcategories for category retrieved');
    } catch (err) {
        next(err);
    }
};

const getAcademicSubcategoriesForPublicByCategoryId = async (req, res, next) => {
    try {
        const { category_id } = req.params;

        if (!category_id) {
            return res.status(400).json({ error: 'category_id is required' });
        }

        const subcategories = await prisma.academicSubcategorys.findMany({
            where: {
                is_active: true,
                category_id: parseInt(category_id),
                category: {
                    is_active: true
                }
            },
            orderBy: { updated_at: 'desc' },
            select: {
                id: true,
                name: true,
                description: true,
            }
        });

        return success(res, subcategories, 'Subcategories for the category retrieved successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createAcademicSubcategory,
    getAllAcademicSubcategories,
    getAcademicSubcategoryById,
    updateAcademicSubcategory,
    deactivateAcademicSubcategory,
    activateAcademicSubcategory,
    searchAcademicSubcategories,
    getSubcategoriesByCategory,
    getAcademicSubcategoriesForPublicByCategoryId
};