const prisma = require('../config/prisma');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { success } = require('../utils/response');



const getJobTitleSuggestions = async (req, res, next) => {
    try {
        const { search = '' } = req.query;

        const titles = await prisma.jobTitles.findMany({
            where: {
                OR: [
                    { title_ar: { contains: search, mode: 'insensitive' } },
                    { title_en: { contains: search, mode: 'insensitive' } }
                ]
            },
            orderBy: { usage_count: 'desc' },
            take: 10,
            select: {
                id: true,
                title_ar: true,
                title_en: true,
            }
        });

        return success(res, titles, 'Suggestions fetched');
    } catch (err) {
        next(err);
    }
};


const searchJobTitles = async (req, res, next) => {
    try {
        const {
            title_ar = '',
            title_en = '',
            page = 1,
            limit = 10
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = {
            AND: [
                {
                    title_ar: {
                        contains: title_ar,
                        mode: 'insensitive'
                    }
                },
                {
                    title_en: {
                        contains: title_en,
                        mode: 'insensitive'
                    }
                }
            ]
        };

        const [data, total] = await Promise.all([
            prisma.jobTitles.findMany({
                where,
                skip,
                take,
                orderBy: { updated_at: 'desc' }
            }),
            prisma.jobTitles.count({ where })
        ]);

        return success(res, {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
            data
        }, 'Job titles search results');
    } catch (err) {
        next(err);
    }
};

const createJobTitle = async (req, res, next) => {
    try {
        const { title_ar, title_en } = req.body;

        const existing = await prisma.jobTitles.findUnique({ where: { title_ar } });
        if (existing) throw new BadRequestError('Job title (Arabic) already exists');

        const jobTitle = await prisma.jobTitles.create({
            data: { title_ar, title_en }
        });

        return success(res, jobTitle, 'Job title created successfully');
    } catch (err) {
        next(err);
    }
};

const getAllJobTitles = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const [data, total] = await Promise.all([
            prisma.jobTitles.findMany({
                skip,
                take,
                orderBy: { updated_at: 'desc' }
            }),
            prisma.jobTitles.count()
        ]);

        return success(res, {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
            data
        }, 'Job titles retrieved successfully');
    } catch (err) {
        next(err);
    }
};

const getJobTitleById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const jobTitle = await prisma.jobTitles.findUnique({
            where: { id: parseInt(id) }
        });

        if (!jobTitle) throw new NotFoundError('Job title not found');

        return success(res, jobTitle, 'Job title retrieved successfully');
    } catch (err) {
        next(err);
    }
};

const updateJobTitle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title_ar, title_en } = req.body;

        const jobTitle = await prisma.jobTitles.findUnique({
            where: { id: parseInt(id) }
        });

        if (!jobTitle) throw new NotFoundError('Job title not found');

        // Ensure title_ar is still unique
        if (title_ar && title_ar !== jobTitle.title_ar) {
            const exists = await prisma.jobTitles.findUnique({ where: { title_ar } });
            if (exists) throw new BadRequestError('title_ar already in use');
        }

        const updated = await prisma.jobTitles.update({
            where: { id: parseInt(id) },
            data: {
                title_ar: title_ar || undefined,
                title_en: title_en || undefined,
                updated_at: new Date()
            }
        });

        return success(res, updated, 'Job title updated successfully');
    } catch (err) {
        next(err);
    }
};

const deleteJobTitle = async (req, res, next) => {
    try {
        const { id } = req.params;

        const jobTitle = await prisma.jobTitles.findUnique({
            where: { id: parseInt(id) }
        });

        if (!jobTitle) throw new NotFoundError('Job title not found');

        await prisma.jobTitles.delete({
            where: { id: parseInt(id) }
        });

        return success(res, null, 'Job title deleted successfully');
    } catch (err) {
        next(err);
    }
};

const incrementJobTitleUsage = async (req, res, next) => {
    try {
        const { id } = req.params;

        const jobTitle = await prisma.jobTitles.findUnique({
            where: { id: parseInt(id) }
        });

        if (!jobTitle) throw new NotFoundError('Job title not found');

        const updated = await prisma.jobTitles.update({
            where: { id: parseInt(id) },
            data: {
                usage_count: { increment: 1 },
                updated_at: new Date()
            }
        });

        return success(res, updated, 'Job title usage count incremented');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    searchJobTitles,
    createJobTitle,
    getAllJobTitles,
    getJobTitleById,
    updateJobTitle,
    deleteJobTitle,
    incrementJobTitleUsage,
    getJobTitleSuggestions,
};
