// prisma/seedAdmins.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAdmins() {
    // Map usernames to roles (make sure roles exist in DB)
    // Roles assumed to be seeded already with names like 'SuperAdmin', 'Moderator', 'SupportAdmin'
    const adminRoleMap = {
        mohammed: 'SuperAdmin',
        khaled: 'Moderator',
        salem: 'SupportAdmin',
    };

    for (const [username, roleName] of Object.entries(adminRoleMap)) {
        const user = await prisma.users.findUnique({ where: { username } });
        const role = await prisma.roles.findUnique({ where: { name: roleName } });

        if (!user || !role) {
            console.warn(`Skipping admin seed for ${username}: user or role not found.`);
            continue;
        }

        await prisma.admins.upsert({
            where: { user_id: user.id },
            update: {},
            create: {
                user_id: user.id,
                role_id: role.id,
            },
        });

        console.log(`Admin record created for user ${username} with role ${roleName}`);
    }
}

module.exports = seedAdmins;