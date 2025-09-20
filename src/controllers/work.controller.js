const prisma = require('../config/prisma');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');
const { success } = require('../utils/response');
const { incrementSkillsUsageCount } = require('../services/skills.service');
const path = require('path');
const fs = require('fs');


const validFileTypes = ['general', 'gallery_image', 'gallery_video', 'cover'];


const searchWorks = async (req, res, next) => {
    try {
        const {
            user_id,
            category_id,
            subcategory_id,
            title,
            description,
            skills,
            achievement_date_from,
            achievement_date_to,
            page = 1,
            limit = 10
        } = req.query;

        const filters = {};

        if (user_id) filters.user_id = user_id;
        if (category_id) filters.category_id = parseInt(category_id);
        if (subcategory_id) filters.subcategory_id = parseInt(subcategory_id);

        if (title) {
            filters.title = {
                contains: title,
                mode: 'insensitive',
            };
        }

        if (description) {
            filters.description = {
                contains: description,
                mode: 'insensitive',
            };
        }

        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);

            if (skillsArray.length > 0) {
                filters.skills = {
                    hasSome: skillsArray 
                };
            }
        }

        if (achievement_date_from || achievement_date_to) {
            filters.achievement_date = {};
            if (achievement_date_from) filters.achievement_date.gte = new Date(achievement_date_from);
            if (achievement_date_to) filters.achievement_date.lte = new Date(achievement_date_to);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [total, data] = await Promise.all([
            prisma.works.count({ where: filters }),
            prisma.works.findMany({
                where: filters,
                include: {
                    attachments: true,
                    category: true,
                    subcategory: true,
                    user: true
                },
                skip,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' }
            })
        ]);

        return success(res, {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
            data
        }, 'Works search results');
    } catch (err) {
        next(err);
    }
};

const getAllWorks = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalWorks = await prisma.works.count();

        const works = await prisma.works.findMany({
            skip,
            take: limit,
            include: {
                attachments: true,
                category: true,
                subcategory: true,
                user: true
            },
            orderBy: { created_at: 'desc' }
        });

        const totalPages = Math.ceil(totalWorks / limit);

        return success(res, {
            page,
            limit,
            totalPages,
            totalRecords: totalWorks,
            data: works
        }, 'Paginated works fetched successfully');
    } catch (err) {
        next(err);
    }
};

const getWorkById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const work = await prisma.works.findUnique({
            where: { id },
            include: {
                attachments: true,
                category: true,
                subcategory: true,
                user: {
                    include:{
                        user:{
                            select:{
                                username: true,
                                first_name_ar:true,
                                last_name_ar:true,
                                full_name_en:true,
                                avatar:true,
                                is_active:true
                            }
                        }
                    }
                }
            }
        });

        if (!work) throw new NotFoundError('Work not found');

        return success(res, work, 'Work fetched successfully');
    } catch (err) {
        next(err);
    }
};

const createWork = async (req, res, next) => {
    try {
        if (req.user.role !== null) {
            throw new ForbiddenError('Admins are not allowed to create works.');
        }

        const {
            title,
            description,
            skills,
            category_id,
            subcategory_id,
            achievement_date
        } = req.body;

        if (!title || !description || !skills || !category_id || !achievement_date) {
            throw new BadRequestError('Missing required fields.');
        }

        const parsedCategoryId = parseInt(category_id);
        const parsedSubcategoryId = subcategory_id ? parseInt(subcategory_id) : null;
        const parsedAchievementDate = new Date(achievement_date);

        if (isNaN(parsedAchievementDate.getTime())) {
            throw new BadRequestError('Invalid achievement_date.');
        }

        let skillsArray = Array.isArray(skills) ? skills : JSON.parse(skills);

        const newWork = await prisma.works.create({
            data: {
                user_id: req.user.id,
                title,
                description,
                skills: skillsArray,
                category_id: parsedCategoryId,
                subcategory_id: parsedSubcategoryId,
                achievement_date: parsedAchievementDate
            }
        });

        await incrementSkillsUsageCount(skillsArray);

        return success(res, newWork, 'Work created successfully');

    } catch (err) {
        next(err);
    }
};



const uploadAttachments = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) throw new BadRequestError('Missing work_id parameter');

        const work = await prisma.works.findUnique({ where: { id } });
        if (!work) throw new NotFoundError('Work not found');
        if (work.user_id !== req.user.id) throw new ForbiddenError('Not authorized to upload attachments for this work');

        if (!req.files || req.files.length === 0) throw new BadRequestError('No files uploaded');

        let attachments_meta = req.body.attachments_meta;

        if (typeof attachments_meta === 'string') {
            try {
                attachments_meta = JSON.parse(attachments_meta);
            } catch {
                throw new BadRequestError('Invalid attachments_meta JSON.');
            }
        }

        if (!Array.isArray(attachments_meta)) throw new BadRequestError('attachments_meta must be an array.');
        if (attachments_meta.length !== req.files.length) throw new BadRequestError('Number of attachments_meta items does not match number of uploaded files.');

        // Check if new attachments contain more than one cover
        const newCovers = attachments_meta.filter(meta => meta.file_type === 'cover');
        if (newCovers.length > 1) {
            throw new BadRequestError('You can only upload one cover at a time.');
        }

        const existingCover = await prisma.workAttachments.findFirst({
            where: { work_id: id, file_type: 'cover' }
        });

        const attachmentsData = attachments_meta.map(meta => {
            const { filename, file_type } = meta;
            const file = req.files.find(f => f.originalname === filename);
            if (!file) throw new BadRequestError(`File "${filename}" not found in uploaded files.`);
            if (!validFileTypes.includes(file_type)) throw new BadRequestError(`Invalid file_type "${file_type}"`);

            return {
                work_id: id,
                file_url: file.filename,
                file_name: file.originalname,
                file_type
            };
        });

        if (newCovers.length && existingCover) {
            // Transaction: delete existing cover + insert new cover
            await prisma.$transaction(async (tx) => {
                await tx.workAttachments.delete({ where: { id: existingCover.id } });
                await tx.workAttachments.createMany({
                    data: attachmentsData
                });
            });
        } else {
            // Just insert attachments normally
            await prisma.workAttachments.createMany({
                data: attachmentsData
            });
        }

        return success(res, attachmentsData, 'Attachments uploaded successfully');

    } catch (err) {
        next(err);
    }
};




const deleteAttachment = async (req, res, next) => {
    try {
        const { work_id, attachment_id } = req.params;
        const user_id=req.user.id;

        if (!work_id) {
            throw new BadRequestError('Missing work_id parameter');
        }
        if (!attachment_id) {
            throw new BadRequestError('Missing attachment_id parameter');
        }

        const work = await prisma.works.findUnique({ where: { id: work_id } });
        if (!work) {
            throw new NotFoundError('Work not found');
        }
        if (work.user_id !== user_id) {
            throw new ForbiddenError('Not authorized to delete attachments for this work');
        }

        const attachment = await prisma.workAttachments.findUnique({
            where: { id: attachment_id }
        });
        if (!attachment) {
            throw new NotFoundError('Attachment not found');
        }
        if (attachment.work_id !== work_id) {
            throw new ForbiddenError('Attachment does not belong to this work');
        }


        const filePath = path.join(__dirname, '../uploads', attachment.file_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await prisma.workAttachments.delete({
            where: { id: attachment_id }
        });

        return success(res, { deletedId: attachment_id }, 'Attachment deleted successfully');

    } catch (err) {
        next(err);
    }
};

const updateWork = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError('Work ID is required');
        }

        const {
            title,
            description,
            skills,
            category_id,
            subcategory_id,
            achievement_date
        } = req.body;

        const work = await prisma.works.findUnique({ where: { id } });
        if (!work) throw new NotFoundError('Work not found');

        const dataToUpdate = {
            updated_at: new Date()
        };

        if (title !== undefined) dataToUpdate.title = title;
        if (description !== undefined) dataToUpdate.description = description;
        if (skills !== undefined) dataToUpdate.skills = skills;
        if (category_id !== undefined) dataToUpdate.category_id = category_id;
        if (subcategory_id !== undefined) dataToUpdate.subcategory_id = subcategory_id;

        if (achievement_date !== undefined && achievement_date !== '') {
            const dateObj = new Date(achievement_date);
            if (isNaN(dateObj.getTime())) {
                throw new BadRequestError('Invalid achievement_date format');
            }
            dataToUpdate.achievement_date = dateObj;
        }

        const updatedWork = await prisma.works.update({
            where: { id },
            data: dataToUpdate
        });

        return success(res, updatedWork, 'Work updated successfully');
    } catch (err) {
        next(err);
    }
};

const deleteWork = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await prisma.works.findUnique({ where: { id } });
        if (!existing) throw new NotFoundError('Work not found');

        await prisma.works.delete({ where: { id } });

        return success(res, {}, 'Work deleted successfully');
    } catch (err) {
        next(err);
    }
};

const getUserWorksForPublic = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        if (!user_id) {
            throw new NotFoundError('User ID is required');
        }

        const works = await prisma.works.findMany({
            where: { user_id },
            orderBy: { created_at: 'desc' },
            include: {
                attachments: true, 
                category: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    }
                },

                subcategory: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    }
                },

                user: {
                    include:{
                        user:{
                            select:{
                                username: true,
                                full_name_en: true,
                                first_name_ar: true,
                                last_name_ar: true,
                                avatar: true,
                            }
                        }
                    }
                }
            }
        });

        return success(res, works, `Works fetched successfully`);
    } catch (err) {
        next(err);
    }
};

const getMyWorks = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const works = await prisma.works.findMany({
            where: { user_id: userId },
            include: {
                attachments: true,
                category: true,
                subcategory: true,
            },
            orderBy: { created_at: 'desc' }
        });

        return success(res, works, 'Your works fetched successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllWorks,
    getWorkById,
    createWork,
    updateWork,
    deleteWork,
    searchWorks,
    getUserWorksForPublic,
    uploadAttachments,
    getMyWorks,
    deleteAttachment
};
