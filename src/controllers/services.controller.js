const prisma = require('../config/prisma'); // adjust if you export client differently
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');
const { success } = require('../utils/response');
const fs = require('fs');
const path = require('path');
const Joi = require('joi');


const validFileTypes = ['cover', 'general', 'gallery_image', 'gallery_video'];


const createService = async (req, res, next) => {
    const provider_id = req.user.id;

    try {
        const {
            academic_category_id,
            academic_subcategory_id,
            title,
            description,
            buyer_instructions,
            price,
            delivery_time_days,
            skills
        } = req.body;

        const newService = await prisma.services.create({
            data: {
                provider_id,
                academic_category_id,
                academic_subcategory_id,
                title,
                description,
                buyer_instructions,
                price,
                delivery_time_days,
                skills
            }
        });

        return success(res, newService, 'Service created successfully');
    } catch (err) {
        next(err);
    }
};

const searchServicesForAdmin = async (req, res, next) => {
    try {
        const {
            keyword,
            categoryId,
            subcategoryId,
            minPrice,
            maxPrice,
            is_active,
            owner_frozen,
            admin_frozen,
            page = 1,
            limit = 10,
            sortBy = 'created_at',
            order = 'desc'
        } = req.query;

        const filters = {};

        if (is_active !== undefined) filters.is_active = is_active === 'true';
        if (owner_frozen !== undefined) filters.owner_frozen = owner_frozen === 'true';
        if (admin_frozen !== undefined) filters.admin_frozen = admin_frozen === 'true';

        if (categoryId) filters.academic_category_id = Number(categoryId);
        if (subcategoryId) filters.academic_subcategory_id = Number(subcategoryId);

        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.gte = Number(minPrice);
            if (maxPrice) filters.price.lte = Number(maxPrice);
        }

        if (keyword) {
            filters.OR = [
                { title: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const totalCount = await prisma.services.count({ where: filters });

        const validSortFields = ['price', 'rating', 'created_at'];
        const validOrder = ['asc', 'desc'];

        const orderByField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const orderDirection = validOrder.includes(order.toLowerCase()) ? order.toLowerCase() : 'desc';

        const services = await prisma.services.findMany({
            where: filters,
            skip,
            take: Number(limit),
            orderBy: { [orderByField]: orderDirection },
            select: {
                id: true,
                provider_id: true,
                academic_category_id: true,
                academic_subcategory_id: true,
                title: true,
                description: true,
                is_active: true,
                owner_frozen: true,
                admin_frozen: true,
                price: true,
                delivery_time_days: true,
                rating: true,
                ratings_count: true,
                provider: {
                    select: {
                        user: {
                            select: {
                                full_name_en: true,
                                first_name_ar: true,
                                last_name_ar: true,
                                email: true
                            }
                        }
                    }
                },
                category: {
                    select: { name: true }
                },
                academicSubcategory: {
                    select: { name: true }
                },
                attachments: true
            }
        });

        return success(res, {
            total: totalCount,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalCount / limit),
            data: services
        }, 'Admin search results');
    } catch (err) {
        next(err);
    }
};

const getServiceByIdForPublic = async (req, res, next) => {
    try {
        const { id } = req.params;

        const service = await prisma.services.findFirst({
            where: {
                id,
                is_active: true,
                owner_frozen: false,
                admin_frozen: false
            },
            include: {
                provider: {
                    include: {
                        user: {
                            select: {
                                full_name_en: true,
                                first_name_ar: true,
                                last_name_ar: true
                            }
                        }
                    }
                },
                category: {
                    select: { name: true }
                },
                academicSubcategory: {
                    select: { name: true }
                },
                attachments: true
            }
        });

        if (!service) throw new NotFoundError('Service not found or not publicly available');

        return success(res, service, 'Public service found');
    } catch (err) {
        next(err);
    }
};


const getServiceByIdForAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;

        const service = await prisma.services.findUnique({
            where: { id },
            include: {
                provider: {
                    include: {
                        user: {
                            select: {
                                full_name_en: true,
                                first_name_ar: true,
                                last_name_ar: true,
                                email: true
                            }
                        }
                    }
                },
                category: {
                    select: { name: true }
                },
                academicSubcategory: {
                    select: { name: true }
                },
                attachments: true
            }
        });

        if (!service) throw new NotFoundError('Service not found');

        return success(res, service, 'Admin service found');
    } catch (err) {
        next(err);
    }
};

const updateService = async (req, res, next) => {
    try {
        const { id } = req.params;

        const schema = Joi.object({
            academic_category_id: Joi.number().integer().positive().optional(),
            academic_subcategory_id: Joi.number().integer().positive().optional(),
            description: Joi.string().trim().min(10).optional(),
            buyer_instructions: Joi.string().trim().min(5).optional(),
            price: Joi.number().min(0).optional(),
            delivery_time_days: Joi.number().integer().positive().optional(),
            skills: Joi.array().items(Joi.string().trim().min(1)).optional()
        });

        const { error, value: validatedData } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const messages = error.details.map(d => d.message).join(', ');
            throw new BadRequestError(`Validation error: ${messages}`);
        }

        const service = await prisma.services.findUnique({ where: { id } });
        if (!service) throw new NotFoundError('Service not found');

        // Check for ongoing purchases
        const ongoingPurchases = await prisma.servicePurchases.findFirst({
            where: {
                service_id: id,
                OR: [
                    { status: 'pending' },
                    { status: 'in_progress' }
                ]
            }
        });

        if (ongoingPurchases) {
            throw new ForbiddenError('Cannot update service while there are ongoing or pending purchases');
        }

        const updateData = {};

        if (validatedData.academic_category_id !== undefined) {
            updateData.academic_category_id = validatedData.academic_category_id;
        }

        if (validatedData.academic_subcategory_id !== undefined) {
            updateData.academic_subcategory_id = validatedData.academic_subcategory_id;
        }

        if (validatedData.description !== undefined) {
            updateData.description = validatedData.description;
        }

        if (validatedData.buyer_instructions !== undefined) {
            updateData.buyer_instructions = validatedData.buyer_instructions;
        }

        if (validatedData.price !== undefined) {
            updateData.price = validatedData.price;
        }

        if (validatedData.delivery_time_days !== undefined) {
            updateData.delivery_time_days = validatedData.delivery_time_days;
        }

        if (validatedData.skills !== undefined) {
            updateData.skills = validatedData.skills;
        }

        const updatedService = await prisma.services.update({
            where: { id },
            data: updateData
        });

        return success(res, updatedService, 'Service updated');
    } catch (err) {
        next(err);
    }
};

const getServicesByUserId = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const services = await prisma.services.findMany({
            where: { provider_id: userId },
            include: {
                provider: {
                    include: {
                        user: {
                            select: {
                                first_name_ar: true,
                                last_name_ar: true,
                                full_name_en: true
                            }
                        }
                    }
                },
                academicSubcategory: {
                    select: { name: true }
                },
                category: {
                    select: { name: true }
                },
                attachments: true
            }
        });

        return success(res, services, 'Services for user');
    } catch (err) {
        next(err);
    }
};

const toggleOwnerFreeze = async (req, res, next) => {
    try {
        const { id } = req.params;

        const service = await prisma.services.findUnique({ where: { id } });
        if (!service) throw new NotFoundError('Service not found');

        const updated = await prisma.services.update({
            where: { id },
            data: { owner_frozen: !service.owner_frozen }
        });

        return success(res, updated, 'Owner freeze toggled');
    } catch (err) {
        next(err);
    }
};

const toggleAdminFreeze = async (req, res, next) => {
    try {
        const { id } = req.params;

        const service = await prisma.services.findUnique({ where: { id } });
        if (!service) throw new NotFoundError('Service not found');

        const updated = await prisma.services.update({
            where: { id },
            data: { admin_frozen: !service.admin_frozen }
        });

        return success(res, updated, 'Admin freeze toggled');
    } catch (err) {
        next(err);
    }
};

const activateService = async (req, res, next) => {
    try {
        const { id } = req.params;

        const service = await prisma.services.findUnique({ where: { id } });
        if (!service) throw new NotFoundError('Service not found');

        const updated = await prisma.services.update({
            where: { id },
            data: { is_active: true }
        });

        return success(res, updated, 'Service activated');
    } catch (err) {
        next(err);
    }
};

const deactivateService = async (req, res, next) => {
    try {
        const { id } = req.params;

        const service = await prisma.services.findUnique({ where: { id } });
        if (!service) throw new NotFoundError('Service not found');

        const updated = await prisma.services.update({
            where: { id },
            data: { is_active: false }
        });

        return success(res, updated, 'Service deactivated');
    } catch (err) {
        next(err);
    }
};

const approveService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { admin_id } = req.user.id;

        const service = await prisma.services.findUnique({ where: { id } });
        if (!service) throw new NotFoundError('Service not found');

        const updated = await prisma.services.update({
            where: { id },
            data: {
                admin_approved_id: admin_id,
                approved_at: new Date()
            }
        });

        return success(res, updated, 'Service approved by admin');
    } catch (err) {
        next(err);
    }
};

const uploadServiceAttachments = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new BadRequestError('Missing service_id parameter');
        }

        const service = await prisma.services.findUnique({ where: { id } });
        if (!service) {
            throw new NotFoundError('Service not found');
        }

        // Check if files are present
        if (!req.files || req.files.length === 0) {
            throw new BadRequestError('No files uploaded');
        }

        let attachments_meta = req.body.attachments_meta;

        // Parse JSON if attachments_meta is a string
        if (typeof attachments_meta === 'string') {
            try {
                attachments_meta = JSON.parse(attachments_meta);
            } catch {
                throw new BadRequestError('Invalid attachments_meta JSON.');
            }
        }

        if (!Array.isArray(attachments_meta)) {
            throw new BadRequestError('attachments_meta must be an array.');
        }

        if (attachments_meta.length !== req.files.length) {
            throw new BadRequestError('Number of attachments_meta items does not match number of uploaded files.');
        }

        // Validate new covers
        const newCoversCount = attachments_meta.filter(meta => meta.file_type === 'cover').length;
        if (newCoversCount > 1) {
            throw new BadRequestError('Only one attachment can be of type "cover".');
        }

        // Check if service already has a cover
        const existingCover = await prisma.serviceAttachments.findFirst({
            where: {
                service_id: id,
                file_type: 'cover'
            }
        });
        if (existingCover && newCoversCount > 0) {
            throw new BadRequestError('This service already has a cover attachment.');
        }

        // Prepare attachments for insertion
        const attachmentsData = [];

        attachments_meta.forEach((meta, i) => {
            const { filename, file_type } = meta;

            if (!validFileTypes.includes(file_type)) {
                throw new BadRequestError(`Invalid file_type "${file_type}" at index ${i}.`);
            }

            const file = req.files.find(f => f.originalname === filename);
            if (!file) {
                throw new BadRequestError(`File "${filename}" not found in uploaded files.`);
            }

            attachmentsData.push({
                service_id: id,
                file_url: file.filename,
                file_name: file.originalname,
                file_type
            });
        });

        await prisma.serviceAttachments.createMany({
            data: attachmentsData
        });

        return success(res, attachmentsData, 'Attachments uploaded successfully');
    } catch (err) {
        next(err);
    }
};


const deleteServiceAttachment = async (req, res, next) => {
    try {
        const service_id = req.params.id;
        const attachment_id = req.params.attachment_id;

        if (!service_id) {
            throw new BadRequestError('Missing service_id parameter');
        }
        if (!attachment_id) {
            throw new BadRequestError('Missing attachment_id parameter');
        }

        const service = await prisma.services.findUnique({ where: { id: service_id } });
        if (!service) {
            throw new NotFoundError('Service not found');
        }


        if (service.provider_id !== req.user.id) {
            throw new ForbiddenError('Not authorized to delete attachments for this service');
        }

        // Validate attachment exists and belongs to this service
        const attachment = await prisma.serviceAttachments.findUnique({ where: { id: attachment_id } });
        if (!attachment) {
            throw new NotFoundError('Attachment not found');
        }
        if (attachment.service_id !== service_id) {
            throw new ForbiddenError('Attachment does not belong to this service');
        }

        // Delete physical file if exists 
        const filePath = path.join(__dirname, '..', 'uploads', attachment.file_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await prisma.serviceAttachments.delete({ where: { id: attachment_id } });

        return success(res, { deletedId: attachment_id }, 'Attachment deleted successfully');
    } catch (err) {
        next(err);
    }
};


const getMyServices = async (req, res, next) => {
    try {
        const provider_id = req.user.id;

        const services = await prisma.services.findMany({
            where: {
                provider_id,
                is_active: true
            },
            include: {
                academicSubcategory: { select: { name: true } },
                category: { select: { name: true } },
                attachments: true
            }
        });

        return success(res, services, 'My active services');
    } catch (err) {
        next(err);
    }
};

const searchServicesForPublic = async (req, res, next) => {
    try {
        const {
            keyword,
            categoryId,
            subcategoryId,
            minPrice,
            maxPrice,
            page = 1,
            limit = 10,
            sortBy = 'created_at',
            order = 'desc'
        } = req.query;

        const filters = {
            is_active: true,
            owner_frozen: false,
            admin_frozen: false,
            NOT: {
                admin_approved_id: null
            }
        };

        if (categoryId) filters.academic_category_id = Number(categoryId);
        if (subcategoryId) filters.academic_subcategory_id = Number(subcategoryId);
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.gte = Number(minPrice);
            if (maxPrice) filters.price.lte = Number(maxPrice);
        }

        if (keyword) {
            filters.OR = [
                { title: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const totalCount = await prisma.services.count({ where: filters });

        const validSortFields = ['price', 'rating', 'created_at'];
        const validOrder = ['asc', 'desc'];

        const orderByField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const orderDirection = validOrder.includes(order.toLowerCase()) ? order.toLowerCase() : 'desc';

        const services = await prisma.services.findMany({
            where: filters,
            skip,
            take: Number(limit),
            orderBy: { [orderByField]: orderDirection },
            select: {
                id: true,
                provider_id: true,
                academic_category_id: true,
                academic_subcategory_id: true,
                title: true,
                price: true,
                delivery_time_days: true,
                rating: true,
                ratings_count: true,
                provider: {
                    select: {
                        user: {
                            select: {
                                first_name_ar: true,
                                last_name_ar: true,
                                full_name_en: true
                            }
                        }
                    }
                },
                category: {
                    select: { name: true }
                },
                academicSubcategory: {
                    select: { name: true }
                },
                attachments: true
            }
        });

        return success(res, {
            total: totalCount,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalCount / limit),
            data: services
        }, 'Search results');
    } catch (err) {
        next(err);
    }
};

const getServicesByUserIdForPublic = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const services = await prisma.services.findMany({
            where: {
                provider_id: userId,
                is_active: true,
                owner_frozen: false,
                admin_frozen: false,
                NOT: {
                    admin_approved_id: null
                }
            },
            include: {
                provider: {
                    include: {
                        user: {
                            select: {
                                first_name_ar: true,
                                last_name_ar: true,
                                full_name_en: true
                            }
                        }
                    }
                },
                academicSubcategory: {
                    select: { name: true }
                },
                category: {
                    select: { name: true }
                },
                attachments: true
            }
        });

        return success(res, services, 'Public services for user');
    } catch (err) {
        next(err);
    }
};

const getServicesByUserIdForAdmin = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const services = await prisma.services.findMany({
            where: {
                provider_id: userId
            },
            include: {
                provider: {
                    include: {
                        user: {
                            select: {
                                first_name_ar: true,
                                last_name_ar: true,
                                full_name_en: true,
                                email: true
                            }
                        }
                    }
                },
                academicSubcategory: {
                    select: { name: true }
                },
                category: {
                    select: { name: true }
                },
                attachments: true
            }
        });

        return success(res, services, 'Admin view of all services for user');
    } catch (err) {
        next(err);
    }
};


module.exports = {
    createService,
    updateService,
    getServicesByUserId,
    getMyServices,
    toggleOwnerFreeze,
    toggleAdminFreeze,
    deleteServiceAttachment,
    uploadServiceAttachments,
    activateService,
    deactivateService,
    approveService,
    searchServicesForPublic,
    getServicesByUserIdForPublic,
    getServicesByUserIdForAdmin,
    searchServicesForAdmin,
    getServiceByIdForPublic,
    getServiceByIdForAdmin
};
