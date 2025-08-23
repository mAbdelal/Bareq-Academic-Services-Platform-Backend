// prisma/seedAcademicSubcategorys.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAcademicSubcategorys() {
    // Fetch all academic categories with their ids
    const categories = await prisma.academicCategorys.findMany();

    if (!categories.length) {
        console.error('🚫 No AcademicCategorys found. Please seed categories first.');
        return;
    }

    // Example subcategories data linked by category name
    const subcategoriesData = [
        {
            categoryName: 'الهندسة',
            subcategories: [
                { name: 'الهندسة المدنية', description: 'تصميم وبناء البنية التحتية مثل الجسور والمباني' },
                { name: 'الهندسة الكهربائية', description: 'دراسة وتصميم الأنظمة الكهربائية والإلكترونية' },
                { name: 'الهندسة الميكانيكية', description: 'تصميم وتحليل الأنظمة الميكانيكية' },
            ],
        },
        {
            categoryName: 'العلوم الطبية',
            subcategories: [
                { name: 'الطب البشري', description: 'الدراسة الطبية والعلاجية للإنسان' },
                { name: 'طب الأسنان', description: 'العناية بصحة الفم والأسنان' },
                { name: 'التمريض', description: 'رعاية المرضى والدعم الطبي' },
            ],
        },
        {
            categoryName: 'علوم الحاسوب',
            subcategories: [
                { name: 'برمجة التطبيقات', description: 'تطوير تطبيقات سطح المكتب والويب' },
                { name: 'الذكاء الاصطناعي', description: 'دراسة وتصميم أنظمة ذكية' },
                { name: 'شبكات الحاسوب', description: 'تصميم وإدارة الشبكات' },
            ],
        },
    ];

    for (const categoryData of subcategoriesData) {
        const category = categories.find(c => c.name === categoryData.categoryName);
        if (!category) {
            console.warn(`⚠️ Category "${categoryData.categoryName}" not found. Skipping its subcategories.`);
            continue;
        }

        for (const subcat of categoryData.subcategories) {
            try {
                await prisma.academicSubcategorys.upsert({
                    where: {
                        category_id_name: {
                            category_id: category.id,
                            name: subcat.name,
                        }
                    },
                    update: {},
                    create: {
                        category_id: category.id,
                        name: subcat.name,
                        description: subcat.description,
                        is_active: true,
                    }
                });
                console.log(`✅ Seeded subcategory "${subcat.name}" under "${category.name}"`);
            } catch (error) {
                console.error(`❌ Failed to seed subcategory "${subcat.name}":`, error);
            }
        }
    }

    console.log('✅ AcademicSubcategorys seeding complete');
}

module.exports = seedAcademicSubcategorys;