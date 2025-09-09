const prisma = require('../config/prisma');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { success } = require('../utils/response');


const getSkillSuggestions = async (req, res, next) => {
    try {
        const { query = '' } = req.query;

        const skills = await prisma.skills.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            orderBy: { usage_count: 'desc' },
            take: 10,
            select: {
                id: true,
                name: true,
            }
        });

        return success(res, skills, 'Skill suggestions fetched');
    } catch (err) {
        next(err);
    }
};

const searchSkills = async (req, res, next) => {
    try {
        const {
            name = '',
            page = 1,
            limit = 10
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = {
            name: {
                contains: name,
                mode: 'insensitive'
            }
        };

        const [data, total] = await Promise.all([
            prisma.skills.findMany({
                where,
                skip,
                take,
                orderBy: { updated_at: 'desc' }
            }),
            prisma.skills.count({ where })
        ]);

        return success(res, {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
            data
        }, 'Skills search results');
    } catch (err) {
        next(err);
    }
};

const createSkill = async (req, res, next) => {
    try {
        const { name } = req.body;

        const existing = await prisma.skills.findUnique({ where: { name } });
        if (existing) throw new BadRequestError('Skill name already exists');

        const skill = await prisma.skills.create({
            data: { name }
        });

        return success(res, skill, 'Skill created successfully');
    } catch (err) {
        next(err);
    }
};

const getAllSkills = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const [data, total] = await Promise.all([
            prisma.skills.findMany({
                skip,
                take,
                orderBy: { updated_at: 'desc' }
            }),
            prisma.skills.count()
        ]);

        return success(res, {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
            data
        }, 'Skills retrieved successfully');
    } catch (err) {
        next(err);
    }
};

const getSkillById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const skill = await prisma.skills.findUnique({
            where: { id: parseInt(id) }
        });

        if (!skill) throw new NotFoundError('Skill not found');

        return success(res, skill, 'Skill retrieved successfully');
    } catch (err) {
        next(err);
    }
};

const updateSkill = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const skill = await prisma.skills.findUnique({
            where: { id: parseInt(id) }
        });

        if (!skill) throw new NotFoundError('Skill not found');

        if (name && name !== skill.name) {
            const exists = await prisma.skills.findUnique({ where: { name } });
            if (exists) throw new BadRequestError('Skill name already in use');
        }

        const updated = await prisma.skills.update({
            where: { id: parseInt(id) },
            data: {
                name: name || undefined,
                updated_at: new Date()
            }
        });

        return success(res, updated, 'Skill updated successfully');
    } catch (err) {
        next(err);
    }
};

const deleteSkill = async (req, res, next) => {
    try {
        const { id } = req.params;

        const skill = await prisma.skills.findUnique({
            where: { id: parseInt(id) }
        });

        if (!skill) throw new NotFoundError('Skill not found');

        await prisma.skills.delete({
            where: { id: parseInt(id) }
        });

        return success(res, null, 'Skill deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getSkillSuggestions,
    searchSkills,
    createSkill,
    getAllSkills,
    getSkillById,
    updateSkill,
    deleteSkill,
};
