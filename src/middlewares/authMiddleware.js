const { verifyAccessToken } = require('../utils/jwt');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');


function authenticate(req, res, next) {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            throw new UnauthorizedError('No token provided');
        }

        const decoded = verifyAccessToken(token);

        req.user = decoded;

        next();
    } catch (err) {
        next(new UnauthorizedError('Invalid or expired token'));
    }
}


const authorize = (...requiredPermissions) => {
    return async (req, res, next) => {
        try {
            // 1. Get user ID from request (set by authentication middleware)
            const userId = req.user?.id;

            if (!userId) {
                throw new UnauthorizedError('Unauthorized - No user ID found');
            }

            // 2. Fetch the admin with their role and permissions
            const admin = await prisma.admins.findUnique({
                where: { user_id: userId },
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    },
                    user: true 
                }
            });

            // 3. Ensure user is an admin
            if (!admin) {
                throw new ForbiddenError('Forbidden - User is not an admin');
            }

            // 4. Check if the admin's user account is active
            if (!admin.user?.is_active) {
                throw new ForbiddenError('Forbidden - Admin account is inactive');
            }

            // 5. Permission check
            const userPermissions = admin.role.permissions.map(
                rp => rp.permission.name
            );

            const hasAllPermissions = requiredPermissions.every(perm =>
                userPermissions.includes(perm)
            );

            if (!hasAllPermissions) {
                throw new ForbiddenError('Forbidden - Insufficient permissions');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

//Ensures only the admin himself can perform the action
const isSelfAdmin = async (req, res, next) => {
    try {
        const authenticatedUserId = req.user?.id;
        const targetUserId = req.params.id;

        if (!authenticatedUserId) {
            throw new ForbiddenError('Unauthorized - No authenticated user found');
        }

        // Ensure the user is updating *himself*
        if (authenticatedUserId !== targetUserId) {
            throw new ForbiddenError('Access denied - You can only modify your own profile');
        }

        next();
    } catch (error) {
        next(error);
    }
};

// If true, SuperAdmin can modify self. If false, no one can modify SuperAdmin (even self).
const protectSuperAdminTarget = (allowSelf = false) => {
    return async (req, res, next) => {
        try {
            const targetUserId = req.params.id;

            if (!targetUserId) {
                throw new ForbiddenError('Target user ID is required');
            }

            // Fetch target admin
            const targetAdmin = await prisma.admins.findUnique({
                where: { user_id: targetUserId },
                include: { role: true }
            });

            if (!targetAdmin) {
                throw new ForbiddenError('Target admin not found');
            }

            // If target is SuperAdmin
            if (targetAdmin.role?.name === 'SuperAdmin') {
                // If not allowed to modify self, or not self
                if (!allowSelf || req.user?.id !== targetUserId) {
                    throw new ForbiddenError('SuperAdmin account cannot be modified by others');
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};


const isSelfAcademicUser = (req, res, next) => {
    try{
        const userId = req.user?.id;
        const targetId = req.params.id;

        if (!userId || !targetId) {
            throw new ForbiddenError('Unauthorized - User ID missing'); 
        }

        if (userId !== targetId) {
            throw new ForbiddenError('Access denied - You are not authorized to perform this action');
        }

        next();
    }catch (error) {
        next(error);
    }
};

async function checkWorkOwnership(req, res, next) {
    try {
        const userIdFromToken = req.user.id;
        const { id } = req.params;
        const work = await prisma.works.findUnique({
            where: { id: id }, 
            select: {
                user_id: true,
            },
        });
        if (!work) throw new NotFoundError('Work not found');
        if (work.user_id !== userIdFromToken) {
            throw new ForbiddenError('You can only modify your own works');
        }
        return next();
    } catch (err) {
        next(err);
    }
}

const checkServiceOwnership = async (req, res, next) => {
    try {
        const serviceId = req.params.id;

        if (!serviceId) {
            throw new NotFoundError('Service ID not provided');
        }

        const service = await prisma.services.findUnique({
            where: { id: serviceId },
            select: { provider_id: true }
        });

        if (!service) {
            throw new NotFoundError('Service not found');
        }

        if (service.provider_id !== req.user.id) {
            throw new ForbiddenError('You do not own this service');
        }

        next();
    } catch (err) {
        next(err);
    }
};





module.exports = {
    authenticate,
    authorize,
    isSelfAdmin,
    protectSuperAdminTarget,
    isSelfAcademicUser,
    checkWorkOwnership,
    checkServiceOwnership
};
