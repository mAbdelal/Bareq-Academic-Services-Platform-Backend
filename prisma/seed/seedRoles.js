// prisma/seedRoles.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedRoles() {
    const rolesData = [
        { name: 'SuperAdmin', description: 'Full access to all admin features' },
        { name: 'Moderator', description: 'Can manage users and content' },
        { name: 'SupportAdmin', description: 'Handles user support and disputes' },
    ]

    for (const role of rolesData) {
        await prisma.roles.upsert({
            where: { name: role.name },
            update: {},
            create: {
                name: role.name,
                description: role.description,
            },
        })
    }
    console.log('Admin roles seeded!')
}

module.exports = seedRoles;


