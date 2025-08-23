// prisma/seedRolePermissions.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedRolePermissions() {
    // Define permissions for each admin role
    const rolesPermissionsMap = {
        SuperAdmin: [
            'manage_users',
            'manage_services',
            'manage_requests',
            'view_reports',
            'resolve_disputes',
        ],
        Moderator: [
            'manage_users',
            'manage_services',
            'manage_requests',
            'view_reports',
        ],
        SupportAdmin: [
            'resolve_disputes',
            'view_reports',
        ],
    }

    // Fetch all roles and permissions
    const roles = await prisma.roles.findMany({
        where: { name: { in: Object.keys(rolesPermissionsMap) } },
    })
    const permissions = await prisma.permissions.findMany()

    const getRoleId = (name) => roles.find((r) => r.name === name)?.id
    const getPermissionId = (name) => permissions.find((p) => p.name === name)?.id

    for (const [roleName, perms] of Object.entries(rolesPermissionsMap)) {
        const roleId = getRoleId(roleName)
        if (!roleId) {
            console.warn(`Role "${roleName}" not found.`)
            continue
        }
        for (const permName of perms) {
            const permId = getPermissionId(permName)
            if (!permId) {
                console.warn(`Permission "${permName}" not found.`)
                continue
            }

            await prisma.rolePermission.upsert({
                where: {
                    role_id_permission_id: {
                        role_id: roleId,
                        permission_id: permId,
                    },
                },
                update: {},
                create: {
                    role_id: roleId,
                    permission_id: permId,
                },
            })
        }
    }

    console.log('Role permissions seeded for multiple admin roles!')
}



module.exports = seedRolePermissions;