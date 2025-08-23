// prisma/seedAcademicCategorys.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAcademicCategorys() {
    const categoriesData = [
        {
            name: 'الهندسة',
            description: 'فئات الهندسة المختلفة مثل الهندسة المدنية والكهربائية والميكانيكية',
            is_active: true,
        },
        {
            name: 'العلوم الطبية',
            description: 'التخصصات الطبية والصحية مثل الطب وطب الأسنان والتمريض',
            is_active: true,
        },
        {
            name: 'العلوم الإنسانية',
            description: 'دراسات التاريخ، الفلسفة، اللغات، والعلوم الاجتماعية',
            is_active: true,
        },
        {
            name: 'علوم الحاسوب',
            description: 'تخصصات الحوسبة، البرمجة، تطوير البرمجيات، والذكاء الاصطناعي',
            is_active: true,
        },
        {
            name: 'الأعمال والإدارة',
            description: 'تخصصات الإدارة، التسويق، المحاسبة، والتمويل',
            is_active: true,
        },
        {
            name: 'الفنون',
            description: 'التخصصات الفنية مثل التصميم، الموسيقى، المسرح، والرسم',
            is_active: true,
        },
        {
            name: 'القانون',
            description: 'الدراسات القانونية والقانون الدولي والقانون المدني',
            is_active: true,
        },
    ];

    for (const category of categoriesData) {
        await prisma.academicCategorys.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }

    console.log('✅ AcademicCategorys seeded successfully.');
}



module.exports = seedAcademicCategorys;
