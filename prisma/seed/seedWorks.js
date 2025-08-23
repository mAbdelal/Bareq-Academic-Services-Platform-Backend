const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Fetch some academic users to assign works to
    const academicUsers = await prisma.academicUsers.findMany({
        take: 10,
        select: { user_id: true }
    });

    // Fetch some categories and subcategories
    const categories = await prisma.academicCategorys.findMany({
        take: 5,
        select: { id: true }
    });
    const subcategories = await prisma.academicSubcategorys.findMany({
        take: 5,
        select: { id: true, category_id: true }
    });

    // Sample works data
    const worksData = [
        {
            title: 'تطوير موقع إلكتروني',
            description: 'تم تطوير موقع إلكتروني باستخدام React وNode.js.',
            skills: ['React', 'Node.js', 'Frontend', 'Backend'],
            achievement_date: new Date('2023-06-01'),
        },
        {
            title: 'بحث علمي في الذكاء الاصطناعي',
            description: 'بحث منشور حول تطبيقات الذكاء الاصطناعي في التعليم.',
            skills: ['AI', 'Machine Learning', 'Research'],
            achievement_date: new Date('2022-12-15'),
        },
        {
            title: 'تصميم شعار احترافي',
            description: 'تصميم شعار لشركة ناشئة باستخدام Adobe Illustrator.',
            skills: ['Design', 'Logo', 'Illustrator'],
            achievement_date: new Date('2023-01-20'),
        },
        {
            title: 'تحليل بيانات سوقية',
            description: 'تحليل بيانات سوقية باستخدام Python وExcel.',
            skills: ['Data Analysis', 'Python', 'Excel'],
            achievement_date: new Date('2023-03-10'),
        },
        {
            title: 'تطوير تطبيق موبايل',
            description: 'تطوير تطبيق موبايل لأنظمة أندرويد باستخدام Flutter.',
            skills: ['Flutter', 'Mobile', 'Android'],
            achievement_date: new Date('2023-04-05'),
        },
    ];

    // Seed works for each academic user, cycling through worksData, categories, and subcategories
    for (let i = 0; i < academicUsers.length; i++) {
        const user = academicUsers[i];
        const workInfo = worksData[i % worksData.length];
        const category = categories[i % categories.length];
        const subcategory = subcategories[i % subcategories.length];

        try {
            await prisma.works.create({
                data: {
                    user_id: user.user_id,
                    title: workInfo.title,
                    description: workInfo.description,
                    skills: workInfo.skills,
                    category_id: category.id,
                    subcategory_id: subcategory.id,
                    achievement_date: workInfo.achievement_date,
                }
            });
            console.log(`Seeded work for user_id: ${user.user_id}`);
        } catch (error) {
            console.error(`Failed to seed work for user_id: ${user.user_id}`, error);
        }
    }
}

module.exports = main;