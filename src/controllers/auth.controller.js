const prisma = require('../config/prisma');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { hashPassword, comparePasswords, isValidEmail, isStrongPassword } = require('../utils/auth');
const { UnauthorizedError, BadRequestError, NotFoundError } = require('../utils/errors');
const { success } = require('../utils/response');
const crypto = require('crypto');
const { RESET_TOKEN_EXPIRES_IN, FRONTEND_URL, NODE_ENV } = require('../config/env');
const { sendEmail } = require("../utils/email");
const Joi = require("joi");


function parseTimeToMilliseconds(timeString) {
    const unit = timeString.slice(-1);
    const value = parseInt(timeString.slice(0, -1), 10);
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'w': return value * 7 * 24 * 60 * 60 * 1000;
        default: throw new Error('Invalid time unit');
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!isValidEmail(email) || !password) {
            throw new BadRequestError('Invalid credentials');
        }

        const user = await prisma.users.findUnique({
            where: { email },
            include: {
                admin: {
                    include: {
                        role: true, 
                    },
                },
            },
        });

        if (!user) throw new UnauthorizedError('Invalid credentials');

        const valid = await comparePasswords(password, user.password_hash);
        if (!valid) throw new UnauthorizedError('Invalid credentials');
        if (!user.is_active) throw new UnauthorizedError('Account is inactive');

        const role = user.admin?.role?.name || null;

        const payload = {
            id: user.id,
            email: user.email,
            role,
            first_name_ar: user.first_name_ar,
            last_name_ar: user.last_name_ar,
            full_name_en: user.full_name_en,
            username: user.username,
        };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        return success(res, {
            accessToken,
            refreshToken,
            user: payload,
        }, 'Login successful');
    } catch (err) {
        next(err);
    }
}

async function refreshToken(req, res, next) {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) throw new BadRequestError('No refresh token provided');

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded?.id) throw new UnauthorizedError('Invalid refresh token');

        const user = await prisma.users.findUnique({
            where: { id: decoded.id },
            include: {
                admin: {
                    include: {
                        role: true
                    }
                }
            }
        });

        if (!user) throw new UnauthorizedError('User not found');
        if (!user.is_active) throw new UnauthorizedError('Account is inactive');

        const role = user.admin?.role?.name || null;

        const payload = {
            id: user.id,
            email: user.email,
            role,
            first_name_ar: user.first_name_ar,
            last_name_ar: user.last_name_ar,
            full_name_en: user.full_name_en,
            username: user.username,
        };

        const newAccessToken = signAccessToken(payload);

        return success(res, {
            accessToken: newAccessToken,
            user: payload
        }, 'Token refreshed');
    } catch (err) {
        next(err);
    }
}

async function forgotPassword(req, res, next) {
    try {
        const { email } = req.body;

        if (!isValidEmail(email)) {
            throw new BadRequestError('Invalid email');
        }

        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpires = new Date(Date.now() + parseTimeToMilliseconds(RESET_TOKEN_EXPIRES_IN));

        await prisma.users.update({
            where: { email },
            data: {
                reset_password_token: resetTokenHash,
                reset_password_expires: resetTokenExpires,
            },
        });

        const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

        if (NODE_ENV === 'production') {
            await sendEmail({
                to: email,
                subject: 'Password Reset',
                html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
            });
        } else {
            console.log(resetLink);
        }

        return success(res, {}, 'Password reset link sent');
    } catch (err) {
        next(err);
    }
}

async function resetPassword(req, res, next) {
    try {
        const { token, password } = req.body;
        if (!token) throw new BadRequestError('Invalid request');
        if (!isStrongPassword(password)) throw new BadRequestError('Weak password: it must be at least 8 characters long and contain letters and numbers');

        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const user = await prisma.users.findFirst({
            where: {
                reset_password_token: resetTokenHash,
                reset_password_expires: { gt: new Date() },
            },
        });

        if (!user) throw new UnauthorizedError('Invalid or expired token');

        const newPasswordHash = await hashPassword(password);

        await prisma.users.update({
            where: { id: user.id },
            data: {
                password_hash: newPasswordHash,
                reset_password_token: null,
                reset_password_expires: null,
            },
        });

        return success(res, {}, 'Password reset successful');
    } catch (err) {
        next(err);
    }
}

async function changePassword(req, res, next) {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        if (!isStrongPassword(newPassword)) throw new BadRequestError('Weak password: it must be at least 8 characters long and contain letters and numbers');

        const user = await prisma.users.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedError('User not found');

        const valid = await comparePasswords(oldPassword, user.password_hash);
        if (!valid) throw new UnauthorizedError('Old password incorrect');

        const newPasswordHash = await hashPassword(newPassword);

        await prisma.users.update({
            where: { id: userId },
            data: { password_hash: newPasswordHash },
        });

        return success(res, {}, 'Password changed successfully');
    } catch (err) {
        next(err);
    }
}

async function checkUsernameAvailability(req, res, next) {
    try {
        const { username } = req.params;

        if (!username || username.length < 3) {
            throw new BadRequestError('Username must be at least 3 characters long');
        }

        const existing = await prisma.users.findUnique({
            where: { username }
        });

        const isAvailable = !existing;

        return success(res, {
            username,
            isAvailable
        }, isAvailable ? 'Username is available' : 'Username is already taken');
    } catch (err) {
        next(err);
    }
}


function registerUser(type) {
    return async function handler(req, res, next) {
        try {
            if (!['academic', 'admin'].includes(type)) {
                throw new BadRequestError('Invalid registration type');
            }

            const baseSchema = Joi.object({
                email: Joi.string().email().required(),
                username: Joi.string().required(),
                password: Joi.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/).required(),
                first_name_ar: Joi.string().allow('', null),
                last_name_ar: Joi.string().allow('', null),
                full_name_en: Joi.string().allow('', null),
                academicData: Joi.object().optional(),
                role_id: Joi.string().uuid().optional()
            });

            const {
                email,
                username,
                password,
                first_name_ar,
                last_name_ar,
                full_name_en,
                academicData,
                role_id
            } = await baseSchema.validateAsync(req.body, { abortEarly: false });

            const existingUser = await prisma.users.findFirst({
                where: {
                    OR: [{ email }, { username }]
                }
            });

            if (existingUser) {
                throw new BadRequestError('Email or username already in use');
            }

            const password_hash = await hashPassword(password);

            let user, academicUser, admin;

            if (type === 'academic') {
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

                const academicSchema = Joi.object({
                    academic_status: Joi.string().valid(...AcademicStatusEnum).required(),
                    institution: Joi.string().required(),
                    field_of_study: Joi.string().required(),
                    level: Joi.string().allow('', null),
                    graduation_year: Joi.number().integer().min(1900).max(new Date().getFullYear()).allow(null)
                });

                const validatedAcademicData = await academicSchema.validateAsync(academicData || {}, { abortEarly: false });

                await prisma.$transaction(async (tx) => {
                    user = await tx.users.create({
                        data: {
                            email,
                            username,
                            password_hash,
                            first_name_ar,
                            last_name_ar,
                            full_name_en,
                            is_active: true
                        }
                    });

                    academicUser = await tx.academicUsers.create({
                        data: {
                            user_id: user.id,
                            ...validatedAcademicData
                        }
                    });

                    await tx.userBalances.create({
                        data: {
                            user_id: user.id,
                            balance: 0,
                            frozen_amount: 0
                        }
                    });
                });

            } else if (type === 'admin') {
                if (!role_id) {
                    throw new BadRequestError('Missing admin role ID');
                }

                await prisma.$transaction(async (tx) => {
                    user = await tx.users.create({
                        data: {
                            email,
                            username,
                            password_hash,
                            first_name_ar,
                            last_name_ar,
                            full_name_en,
                            is_active: true
                        }
                    });

                    admin = await tx.admins.create({
                        data: {
                            user_id: user.id,
                            role_id
                        }
                    });
                });
            }

            return success(res, {
                user,
                ...(academicUser && { academicUser }),
                ...(admin && { admin })
            }, 'User registered successfully');
        } catch (err) {
            next(err);
        }
    };
}

module.exports = {
    login,
    refreshToken,
    forgotPassword,
    resetPassword,
    changePassword,
    checkUsernameAvailability,
    registerAcademicUser: registerUser('academic'),
    registerAdminUser: registerUser('admin')
};
