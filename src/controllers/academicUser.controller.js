const prisma = require('../config/prisma');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { success } = require('../utils/response');
const fs = require('fs');
const path = require('path');

const AcademicStatusEnum = [
    'high_school_student',
    'high_school_graduate',
    'bachelor_student',
    'bachelor',
    'master_student',
    'master',
    'phd_candidate',
    'phd',
    'alumni',
    'researcher',
    'other'
];

const getAllAcademicUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const take = parseInt(limit);
        const skip = (parseInt(page) - 1) * take;

        const total = await prisma.academicUsers.count();

        const users = await prisma.academicUsers.findMany({
            skip,
            take,
            orderBy: { created_at: 'desc' },
            include: {
                user: {
                    select: {
                        username: true,
                        first_name_ar: true,
                        last_name_ar: true,
                        full_name_en: true,
                        is_active: true
                    }
                }
            }
        });

        return success(res, {
            total,
            page: parseInt(page),
            limit: take,
            totalPages: Math.ceil(total / take),
            count: users.length,
            users
        }, 'Academic users fetched successfully');
    } catch (err) {
        next(err);
    }
};


const getAcademicUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const academic = await prisma.academicUsers.findUnique({
            where: { user_id: id },
            include: {
                user: {
                    select: {
                        username: true,
                        email: true,
                        first_name_ar: true,
                        last_name_ar: true,
                        full_name_en: true,
                        is_active: true
                    }
                }
            }
        });

        if (!academic) throw new NotFoundError('Academic user not found');

        return success(res, academic, 'Academic user fetched successfully');
    } catch (err) {
        next(err);
    }
};

const updateAcademicUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            academic_status,
            university,
            faculty,
            major,
            study_start_year,
            study_end_year,
            job_title,
            skills,
            username,
            first_name_ar,
            last_name_ar,
            full_name_en
        } = req.body;

        // Check if academic user exists
        const academic = await prisma.academicUsers.findUnique({
            where: { user_id: id },
            include: { user: true }
        });

        if (!academic) throw new NotFoundError('Academic user not found');

        // Validate academic_status if provided
        if (academic_status && !AcademicStatusEnum.includes(academic_status)) {
            throw new BadRequestError(`Invalid academic_status value. Must be one of: ${AcademicStatusEnum.join(', ')}`);
        }

        // Check for username uniqueness
        if (username && username !== academic.user.username) {
            const usernameExists = await prisma.users.findFirst({
                where: {
                    username,
                    NOT: { id }
                }
            });
            if (usernameExists) {
                throw new BadRequestError('Username is already taken');
            }
        }

        await prisma.academicUsers.update({
            where: { user_id: id },
            data: {
                academic_status: academic_status || undefined,
                university: university || undefined,
                faculty: faculty || undefined,
                major: major || undefined,
                study_start_year: study_start_year || undefined,
                study_end_year: study_end_year || undefined,
                job_title: job_title || undefined,
                skills: skills || undefined,
                updated_at: new Date()
            }
        });

        await prisma.users.update({
            where: { id },
            data: {
                username: username || undefined,
                first_name_ar: first_name_ar || undefined,
                last_name_ar: last_name_ar || undefined,
                full_name_en: full_name_en || undefined,
                updated_at: new Date()
            }
        });

        return success(res, {}, 'Academic profile and user info updated successfully');
    } catch (err) {
        next(err);
    }
};

const deactivateAcademicUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await prisma.users.findUnique({ where: { id } });
        if (!user) throw new NotFoundError('User not found');

        if (!user.is_active) return success(res, {}, 'Academic user is already deactivated');

        await prisma.users.update({
            where: { id },
            data: {
                is_active: false,
                updated_at: new Date()
            }
        });

        return success(res, {}, 'Academic user deactivated successfully');
    } catch (err) {
        next(err);
    }
};

const activateAcademicUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await prisma.users.findUnique({ where: { id } });
        if (!user) throw new NotFoundError('User not found');

        if (user.is_active) return success(res, {}, 'Academic user is already active');

        await prisma.users.update({
            where: { id },
            data: {
                is_active: true,
                updated_at: new Date()
            }
        });

        return success(res, {}, 'Academic user activated successfully');
    } catch (err) {
        next(err);
    }
};

const searchAcademicUsers = async (req, res, next) => {
    try {
        const { university, major, skills, academic_status, page = 1, limit = 10 } = req.query;
        const take = parseInt(limit);
        const skip = (parseInt(page) - 1) * take;
        console.log(`Searching academic users with filters: ${JSON.stringify(req.query)}`);

        const where = {};
        if (university) where.university = university;
        if (major) where.major = major;
        if (academic_status) where.academic_status = academic_status;
        if (skills) {
            // skills can be comma separated
            const skillsArr = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
            where.skills = { hasSome: skillsArr };
        }

        const total = await prisma.academicUsers.count({ where });
        const users = await prisma.academicUsers.findMany({
            where,
            skip,
            take,
            orderBy: { created_at: 'desc' },
            include: {
                user: {
                    select: {
                        username: true,
                        first_name_ar: true,
                        last_name_ar: true,
                        full_name_en: true,
                        is_active: true
                    }
                }
            }
        });

        return success(res, {
            total,
            page: parseInt(page),
            limit: take,
            totalPages: Math.ceil(total / take),
            count: users.length,
            users
        }, 'Academic users search results');
    } catch (err) {
        next(err);
    }
};

const uploadIdentityDocument = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!req.file) throw new BadRequestError('No file uploaded');

        // 1. Get only the identity_document_url for the academic user
        const academic = await prisma.academicUsers.findUnique({
            where: { user_id: id },
            select: { identity_document_url: true }
        });

        // 2. Delete old file if it exists
        if (academic?.identity_document_url) {
            const oldFilePath = path.join(__dirname, '..', '..', 'uploads', academic.identity_document_url);

            fs.unlink(oldFilePath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Failed to delete old file:', err);
                }
            });
        }

        // 3. Save new file in DB
        await prisma.academicUsers.update({
            where: { user_id: id },
            data: {
                identity_document_url: req.file.filename,
                updated_at: new Date()
            }
        });

        return success(res, null, 'Identity document updated');
    } catch (err) {
        next(err);
    }
};


// const getSelfAcademicUserProfile = async (req, res, next) => {
//     try {
//         const userId = req.user.id;
//         if (!userId) throw new BadRequestError('User not authenticated');

//         const academic = await prisma.academicUsers.findUnique({
//             where: { user_id: userId },
//             include: {
//                 user: {
//                     select: {
//                         username: true,
//                         avatar: true,
//                         first_name_ar: true,
//                         last_name_ar: true,
//                         full_name_en: true,
//                     }
//                 }
//             }
//         });

//         if (!academic) throw new NotFoundError('Academic user profile not found');

//         return success(res, academic, 'Academic user profile fetched');
//     } catch (err) {
//         next(err);
//     }
// };

const getSelfAcademicUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!userId) throw new BadRequestError('User not authenticated');

        const academic = await prisma.academicUsers.findUnique({
            where: { user_id: userId },
            include: {
                user: {
                    select: {
                        username: true,
                        avatar: true,
                        first_name_ar: true,
                        last_name_ar: true,
                        full_name_en: true,
                    }
                },
                balance: true,
            }
        });

        if (!academic) throw new NotFoundError('Academic user profile not found');

        const offers = await prisma.customRequestOffers.findMany({
            where: { provider_id: userId },
            include: { request: true }
        });

        let offersInProgress = 0;
        let offersDone = 0;

        offers.forEach(offer => {
            if (offer.acceptedByRequest) {
                offersDone++;
            } else {
                if (offer.request.status === 'open' || offer.request.status === 'in_progress') {
                    offersInProgress++;
                }
            }
        });

        const buyerPurchaseCounts = await prisma.servicePurchases.groupBy({
            by: ['status'],
            where: { buyer_id: userId },
            _count: { id: true }
        });

        let buyerInProgress = 0;
        let buyerCompleted = 0;

        buyerPurchaseCounts.forEach(p => {
            if (p.status === 'in_progress') buyerInProgress = p._count.id;
            if (p.status === 'completed') buyerCompleted = p._count.id;
        });

        // Count purchases where the user is the provider
        const providerPurchaseCounts = await prisma.servicePurchases.groupBy({
            by: ['status'],
            where: { service: { provider_id: userId } },
            _count: { id: true }
        });

        let providerInProgress = 0;
        let providerCompleted = 0;

        providerPurchaseCounts.forEach(p => {
            if (p.status === 'in_progress') providerInProgress = p._count.id;
            if (p.status === 'completed') providerCompleted = p._count.id;
        });

        // Build response object
        const result = {
            ...academic,
            balance: academic.balance?.balance || 0,
            frozen_balance: academic.balance?.frozen_balance || 0,
            purchases_summary: {
                as_buyer: {
                    in_progress: buyerInProgress,
                    completed: buyerCompleted
                },
                as_provider: {
                    in_progress: providerInProgress,
                    completed: providerCompleted
                }
            },
            offers_summary: {
                in_progress: offersInProgress,
                done: offersDone
            }
        };

        return success(res, result, 'Academic user profile fetched with purchases and offers summary');
    } catch (err) {
        next(err);
    }
};


const getAllAcademicUsersForPublic = async (req, res, next) => {
    try {
        const users = await prisma.academicUsers.findMany({
            where: {
                user: {
                    is_active: true
                }
            },
            orderBy: { created_at: 'desc' },
            include: {
                user: {
                    select: {
                        username: true,
                        full_name_en: true,
                        first_name_ar: true,
                        last_name_ar: true,
                    }
                }
            }
        });

        return success(res, users, 'Academic users retrieved successfully');
    } catch (err) {
        next(err);
    }
};


const getUserRatingPublic = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await prisma.users.findUnique({
            where: { id: id },
            select: { academicUser: true },
        });

        if (!user || !user.academicUser) {
            throw new NotFoundError('User not found or not an academic user');
        }

        const ratings = await prisma.ratings.findMany({
            where: {
                OR: [
                    { service: { provider_id: user.academicUser.user_id } },
                    { customRequest: { requester_id: user.academicUser.user_id } },
                ],
            },
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                rating: true,
                comment: true,
                created_at: true,
                rater: {
                    select: {
                        user: {
                            select: {
                                avatar: true,
                                full_name_en: true,
                                first_name_ar: true,
                                last_name_ar: true,
                            },
                        },
                    },
                },
                service: {
                    select: { title: true },
                },
                customRequest: {
                    select: { title: true },
                },
            },
        });

        const formattedRatings = ratings.map((r) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            user: r.rater.user,
            service_title: r.service?.title || null,
            custom_request_title: r.customRequest?.title || null,
        }));

        return success(res, formattedRatings, 'User ratings fetched successfully');
    } catch (error) {
        next(error);
    }
};


const getProfileForPublic = async (req, res, next) => {
    try {
        const { id } = req.params;

        const academicUser = await prisma.academicUsers.findUnique({
            where: { user_id: id },
            include: {
                user: {
                    select: {
                        username: true,
                        full_name_en: true,
                        first_name_ar: true,
                        avatar: true,
                        last_name_ar: true,
                        is_active: true
                    }
                },
            },
        });

        if (!academicUser || !academicUser.user.is_active) {
            return res.status(404).json({ error: 'Academic user not found or inactive' });
        }

        return success(res, academicUser, 'Public academic user profile fetched successfully');
    } catch (err) {
        next(err);
    }
};

const getMyBalance = async (req, res, next) => {
    try {
        const user_id = req.user.id;

        const balance = await prisma.userBalances.findUnique({
            where: { user_id },
        });

        if (!balance) throw new NotFoundError("Balance record not found");

        return success(res, balance);
    } catch (err) {
        next(err);
    }
};


const getUserBalanceByAdmin = async (req, res, next) => {
    try {
        const { id: user_id } = req.params;

        const balance = await prisma.userBalances.findUnique({
            where: { user_id },
        });

        if (!balance) throw new NotFoundError("Balance record not found");

        return success(res, balance);
    } catch (err) {
        next(err);
    }
};

const searchAcademicUsersPublic = async (req, res, next) => {
    try {
        const {
            job_title,
            skills,
            min_rating,
            max_rating,
            page = 1,
            limit = 10
        } = req.query;

        const take = parseInt(limit);
        const skip = (parseInt(page) - 1) * take;

        console.log(`Public search for academic users with filters: ${JSON.stringify(req.query)}`);

        const where = {
            user: {
                is_active: true
            }
        };

        if (job_title) {
            where.job_title = {
                contains: job_title,
                mode: 'insensitive'
            };
        }

        if (skills) {
            const skillsArr = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
            where.skills = { hasSome: skillsArr };
        }

        if (min_rating || max_rating) {
            where.rating = {};
            if (min_rating) where.rating.gte = parseFloat(min_rating);
            if (max_rating) where.rating.lte = parseFloat(max_rating);
        }

        const total = await prisma.academicUsers.count({ where });
        const users = await prisma.academicUsers.findMany({
            where,
            skip,
            take,
            orderBy: [
                { rating: 'desc' },
                { ratings_count: 'desc' },
                { created_at: 'desc' }
            ],
            include: {
                user: {
                    select: {
                        username: true,
                        first_name_ar: true,
                        last_name_ar: true,
                        full_name_en: true,
                        avatar: true
                    }
                }
            }
        });

        return success(res, {
            total,
            page: parseInt(page),
            limit: take,
            totalPages: Math.ceil(total / take),
            count: users.length,
            users
        }, 'Public search results for academic users');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllAcademicUsers,
    getAcademicUserById,
    updateAcademicUser,
    deactivateAcademicUser,
    activateAcademicUser,
    searchAcademicUsers,
    searchAcademicUsersPublic,
    uploadIdentityDocument,
    getSelfAcademicUserProfile,
    getAllAcademicUsersForPublic,
    getProfileForPublic,
    getMyBalance,
    getUserBalanceByAdmin,
    getUserRatingPublic
};
