
// prisma/seedUsers.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const adminData = [
    {
        username: 'mohammed',
        email: 'superadmin@example.com',
        first_name_ar: 'محمد',
        last_name_ar: 'حسني',
        full_name_en: 'mohammed hussiny',
        is_active: true,
    },
    {
        username: 'khaled',
        email: 'moderator@example.com',
        first_name_ar: 'خالد',
        last_name_ar: 'علي',
        full_name_en: 'khaled ali',
        is_active: true,
    },
    {
        username: 'salem',
        email: 'supportadmin@example.com',
        first_name_ar: 'سالم',
        last_name_ar: 'عبدالله',
        full_name_en: 'salem abduallah',
        is_active: true,
    },
];

const userAcademicData = [
    {
        username: 'ahmed',
        email: 'ahmed.academic@example.com',
        first_name_ar: 'أحمد',
        last_name_ar: 'مصطفى',
        full_name_en: 'Ahmed Mustafa',
        is_active: true,
    },
    {
        username: 'fatima',
        email: 'fatima.academic@example.com',
        first_name_ar: 'فاطمة',
        last_name_ar: 'الزهرا',
        full_name_en: 'Fatima Alzahra',
        is_active: true,
    },
    {
        username: 'yousef',
        email: 'yousef.academic@example.com',
        first_name_ar: 'يوسف',
        last_name_ar: 'ناصر',
        full_name_en: 'Yousef Nasser',
        is_active: true,
    },
    {
        username: 'layla',
        email: 'layla.student@example.com',
        first_name_ar: 'ليلى',
        last_name_ar: 'حسين',
        full_name_en: 'Layla Hussein',
        is_active: true,
    },
    {
        username: 'omar',
        email: 'omar.student@example.com',
        first_name_ar: 'عمر',
        last_name_ar: 'عبدالله',
        full_name_en: 'Omar Abdullah',
        is_active: true,
    },
    {
        username: 'nour',
        email: 'nour.student@example.com',
        first_name_ar: 'نور',
        last_name_ar: 'سعيد',
        full_name_en: 'Nour Said',
        is_active: true,
    },
];

const main = async (usersData) => {
    for (const user of usersData) {
        const password_hash = await bcrypt.hash('12345678', 10);
        await prisma.users.upsert({
            where: { email: user.email },
            update: {},
            create: {
                username: user.username,
                email: user.email,
                password_hash,
                first_name_ar: user.first_name_ar,
                last_name_ar: user.last_name_ar,
                full_name_en: user.full_name_en,
                is_active: user.is_active,
            },
        });
    }
    console.log('Mock users seeded!');
};

module.exports = {
    seedAcademicUsers_general: () => main(userAcademicData),
    seedAdmins_general: () => main(adminData),
};
