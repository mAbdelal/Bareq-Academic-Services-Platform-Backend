const prisma = require('../config/prisma');


async function dbHealthCheck() {
    try {
        // Simple query to check DB connection
        await prisma.$queryRaw`SELECT 1`;
        return { status: 'ok' };
    } catch (error) {
        return { status: 'error', error: error.message };
    }
}

module.exports = dbHealthCheck;
