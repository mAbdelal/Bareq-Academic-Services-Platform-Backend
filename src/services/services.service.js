const prisma = require('../config/prisma');

const updateServiceRating = async (serviceId, newRating) => {
    if (!newRating || newRating < 1 || newRating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }

    const service = await prisma.services.findUnique({
        where: { id: serviceId },
        select: {
            rating: true,
            ratings_count: true
        }
    });

    if (!service) {
        throw new Error('Service not found');
    }

    const { rating: oldAvg, ratings_count: oldCount } = service;

    const newCount = oldCount + 1;
    const newAvg = ((oldAvg * oldCount) + newRating) / newCount;

    const updatedService = await prisma.services.update({
        where: { id: serviceId },
        data: {
            rating: newAvg,
            ratings_count: newCount
        }
    });

    return updatedService;
};

module.exports = {
    updateServiceRating
};
