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
const seedServiceAttachments = require('./seed/seedServiceAttachments');

// 6. Works & Attachments
const seedWorks = require('./seed/seedWorks');
const seedWorkAttachments = require('./seed/seedWorkAttachments');

// 7. Custom Requests & Related
const seedCustomRequests = require('./seed/seedCustomRequests');
const seedCustomRequestAttachments = require('./seed/seedCustomRequestAttachments');
const seedCustomRequestOffers = require('./seed/seedCustomRequestOffers');
const seedOffersAttachments = require('./seed/seedOffersAttachments');
const seedRequestImplementationDeliverables = require('./seed/seedRequestImplementationDeliverables');
const seedRequestDeliverableAttachments = require('./seed/seedRequestDeliverableAttachments');

// 8. Service Purchases & Deliverables
const seedServicePurchases = require('./seed/seedServicePurchases');
const seedServicePurchaseDeliverables = require('./seed/seedServicePurchaseDeliverables');
const seedServicePurchaseAttachments = require('./seed/seedServicePurchaseAttachments');

// 9. Negotiations
const seedNegotiations = require('./seed/seedNegotiations');

// 10. Chats & Messages
const seedChats = require('./seed/seedChats');
const seedMessages = require('./seed/seedMessages');
const seedMessageAttachments = require('./seed/seedMessageAttachments');

// 11. Ratings, Disputes, Transactions, Notifications
const seedRatings = require('./seed/seedRatings');
const seedDisputes = require('./seed/seedDisputes');
const seedTransactions = require('./seed/seedTransactions');
const seedNotifications = require('./seed/seedNotifications');

// 12. Job Titles & Skills
const seedJobTitles = require('./seed/seedJobTitles');
const seedSkills = require('./seed/seedSkills');

const seedSystemBalance = require('./seed/seedSystemBalance');


async function clearDb() {
    console.log('🗑️ Clearing existing data...');

    // Clear all data in reverse dependency order to avoid foreign key constraints
    await prisma.messageAttachments.deleteMany();
    await prisma.messages.deleteMany();
    await prisma.chats.deleteMany();
    await prisma.negotiations.deleteMany();
    await prisma.servicePurchaseAttachments.deleteMany();
    await prisma.servicePurchaseDeliverables.deleteMany();
    await prisma.servicePurchases.deleteMany();
    await prisma.requestDeliverableAttachments.deleteMany();
    await prisma.requestImplementationDeliverables.deleteMany();
    await prisma.customRequestTimeline.deleteMany();
    await prisma.offersAttachments.deleteMany();
    await prisma.customRequestOffers.deleteMany();
    await prisma.customRequestAttachments.deleteMany();
    await prisma.customRequests.deleteMany();
    await prisma.workAttachments.deleteMany();
    await prisma.works.deleteMany();
    await prisma.serviceAttachments.deleteMany();
    await prisma.services.deleteMany();
    await prisma.ratings.deleteMany();
    await prisma.disputes.deleteMany();
    await prisma.transactions.deleteMany();
    await prisma.notifications.deleteMany();
    await prisma.userBalances.deleteMany();
    await prisma.academicUsers.deleteMany();
    await prisma.admins.deleteMany();
    await prisma.users.deleteMany();
    await prisma.academicSubcategorys.deleteMany();
    await prisma.academicCategorys.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.permissions.deleteMany();
    await prisma.roles.deleteMany();
    await prisma.jobTitles.deleteMany();
    await prisma.skills.deleteMany();
    await prisma.systemBalance.deleteMany();

    console.log('✅ Database cleared successfully.');
}

async function main() {

    await clearDb();

    console.log('🌱 Starting to seed new data...');

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
    await seedServiceAttachments();

    // 6. Works & Attachments
    await seedWorks();
    await seedWorkAttachments();

    // 7. Custom Requests & Related
    await seedCustomRequests();
    await seedCustomRequestAttachments();
    await seedCustomRequestOffers();
    await seedOffersAttachments();
    await seedRequestImplementationDeliverables();
    await seedRequestDeliverableAttachments();

    // 8. Service Purchases & Deliverables
    await seedServicePurchases();
    await seedServicePurchaseDeliverables();
    await seedServicePurchaseAttachments();

    // 9. Negotiations
    await seedNegotiations();

    // 10. Chats & Messages
    await seedChats();
    await seedMessages();
    await seedMessageAttachments();

    // 11. Ratings, Disputes, Transactions, Notifications
    await seedRatings();
    await seedDisputes();
    await seedTransactions();
    await seedNotifications();

    // 12. Job Titles & Skills
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
