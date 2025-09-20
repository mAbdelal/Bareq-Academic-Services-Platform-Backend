// prisma/seedPermissions.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedPermissions() {
    const permissionsData = [
        { name: 'manage_users', description: 'Create, update and delete users' },
        { name: 'manage_services', description: 'Create and manage services' },
        { name: 'manage_requests', description: 'Manage custom requests' },
        { name: 'view_reports', description: 'View system reports and analytics' },
        { name: 'resolve_disputes', description: 'Resolve disputes between users' },
        { name: 'manage_role_permissions', description: 'manage_role_permissions' },
        { name: 'manage_roles', description: 'manage_roles' },
        { name: 'manage_permissions', description: 'manage_permissions' },
        { name: 'manage_admins', description: 'manage_admins' },
        { name: 'manage_academic_users', description: 'manage_academic_users' },
        { name: 'manage_academic_categories', description: 'manage_academic_categories' },
    ]

    for (const perm of permissionsData) {
        await prisma.permissions.upsert({
            where: { name: perm.name },
            update: {},
            create: {
                name: perm.name,
                description: perm.description,
            },
        })
    }
    console.log('Permissions seeded!')
}



module.exports = seedPermissions;