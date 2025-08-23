const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { NODE_ENV } = require("./env");

let prisma;

const logFilePath = path.join(__dirname, '..', 'logs', 'prisma.log');

if (!fs.existsSync(path.dirname(logFilePath))) {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}

function logToFile(level, message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFilePath, `[${timestamp}] [${level.toUpperCase()}] ${message}\n`);
}

if (NODE_ENV === 'production') {
    prisma = new PrismaClient({
        log: [
            { level: 'warn', emit: 'event' },
            { level: 'error', emit: 'event' },
        ],
    });

    prisma.$on('warn', (e) => {
        logToFile('warn', e.message);
    });

    prisma.$on('error', (e) => {
        logToFile('error', e.message);
    });
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
        });
    }
    prisma = global.prisma;
}

process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

module.exports = prisma;
