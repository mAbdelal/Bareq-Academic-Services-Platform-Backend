const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.systemBalance.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            total_balance: 0,
        },
    });

    console.log('✅ SystemBalance seeded');
}

module.exports=main;