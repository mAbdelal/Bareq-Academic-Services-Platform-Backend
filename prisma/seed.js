console.log(' Starting database seeding...');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Roles & Permissions
const seedRoles = require('./seed/seedRoles');
const seedPermissions = require('./seed/seedPermissions');
const seedRolePermissions = require('./seed/seedRolePermissions');

// 2. Users
const { seedAcademicUsers_general, seedAdmins_general } = require('./seed/seedUsers');
const seedAdmins = require('./seed/seedAdmins');

// 3. Academic Categories & Subcategories & Tags
const seedAcademicCategories = require('./seed/seedAcademicCategories');
const seedAcademicSubcategories = require('./seed/seedAcademicSubcategories');

// 4. Academic Users & Balances
const seedAcademicUsers = require('./seed/seedAcadmicUsers');
const seedUserBalances = require('./seed/seedUserBalances');

// 5. Services & Related
const seedServices = require('./seed/seedServices');

// 6. Works
const seedWorks = require('./seed/seedWorks');

// 7. Custom Requests & Related
const seedCustomRequests = require('./seed/seedCustomRequests');
const seedCustomRequestOffers = require('./seed/seedCustomRequestOffers');
const seedRequestImplementationDeliverables = require('./seed/seedRequestImplementationDeliverables');

// 8. Service Purchases & Deliverables
const seedServicePurchases = require('./seed/seedServicePurchases');
const seedServicePurchaseDeliverables = require('./seed/seedServicePurchaseDeliverables');

// 9. Chats & Messages
const seedChats = require('./seed/seedChats');
const seedMessages = require('./seed/seedMessages');

// 10. Ratings, Disputes, Transactions, Notifications
const seedRatings = require('./seed/seedRatings');
const seedDisputes = require('./seed/seedDisputes');
const seedTransactions = require('./seed/seedTransactions');
const seedNotifications = require('./seed/seedNotifications');

// 11. Job Titles & Skills
const seedJobTitles = require('./seed/seedJobTitles');
const seedSkills = require('./seed/seedSkills');

const seedSystemBalance=require('./seed/seedSystemBalance');

async function main() {
    await seedSystemBalance();
    
    // 1. Roles & Permissions
    await seedRoles();
    await seedPermissions();
    await seedRolePermissions();

    // 2. Users
    await seedAcademicUsers_general();

    // 3. Academic Categories & Subcategories & Tags
    await seedAcademicCategories();
    await seedAcademicSubcategories();

    // 4. Academic Users & Balances
    await seedAcademicUsers();
    await seedUserBalances();

    // 5. Services & Related
    await seedServices();

    // 6. Works
    await seedWorks();

    // 7. Custom Requests & Related
    await seedCustomRequests();
    await seedCustomRequestOffers();
    await seedRequestImplementationDeliverables();

    // 8. Service Purchases & Deliverables
    await seedServicePurchases();
    await seedServicePurchaseDeliverables();

    // 9. Chats & Messages
    await seedChats();
    await seedMessages();

    // 10. Ratings, Disputes, Transactions, Notifications
    await seedRatings();
    await seedDisputes();
    await seedTransactions();
    await seedNotifications();

    // 11. Job Titles & Skills
    await seedJobTitles();
    await seedSkills();

    // await seedAdmins_general();
    await seedAdmins_general();
    await seedAdmins();

    console.log('✅ Seeding completed.');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
