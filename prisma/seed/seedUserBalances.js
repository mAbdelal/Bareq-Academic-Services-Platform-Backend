const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedUserBalances() {
    // Fetch all academic users
    const academicUsers = await prisma.academicUsers.findMany({
        include: {
            user: true,
        },
    });

    for (const academicUser of academicUsers) {
        const existingBalance = await prisma.userBalances.findUnique({
            where: {
                user_id: academicUser.user_id,
            },
        });

        if (existingBalance) {
            console.log(`Balance already exists for ${academicUser.user.username}`);
            continue;
        }

        await prisma.userBalances.create({
            data: {
                user_id: academicUser.user_id,
                balance: parseFloat((Math.random() * 100).toFixed(2)), // Assign a random balance for example
            },
        });

        console.log(`Balance created for ${academicUser.user.username}`);
    }
}



module.exports = seedUserBalances;