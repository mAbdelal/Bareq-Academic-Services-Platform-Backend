const { PrismaClient, RequestStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const academicUsers = await prisma.academicUsers.findMany();
    const categories = await prisma.academicCategorys.findMany();
    const subcategories = await prisma.academicSubcategorys.findMany();

    if (academicUsers.length === 0 || categories.length === 0) {
        console.error('🚫 Missing data: Seed AcademicUsers and AcademicCategorys first.');
        return;
    }

    const getRandomStatus = () => {
        const statuses = Object.values(RequestStatus);
        return statuses[Math.floor(Math.random() * statuses.length)];
    };

    const skillsList = [
        ['كتابة', 'بحث', 'تحليل'],
        ['برمجة', 'تصميم', 'React'],
        ['ترجمة', 'لغة إنجليزية', 'لغة عربية'],
        ['إحصاء', 'Excel', 'Python'],
        ['PowerPoint', 'عرض تقديمي', 'تصميم'],
    ];

    for (let i = 1; i <= 10; i++) {
        const requester = academicUsers[Math.floor(Math.random() * academicUsers.length)];

        const category = categories[Math.floor(Math.random() * categories.length)];
        const branch = subcategories.length > 0 ? subcategories[Math.floor(Math.random() * subcategories.length)] : null;

        try {
            // ✅ أولاً، أنشئ الطلب واحصل على الـ id
            const request = await prisma.customRequests.create({
                data: {
                    requester_id: requester.user_id,
                    accepted_offer_id: null,
                    academic_category_id: category.id,
                    academic_subcategory_id: branch ? branch.id : null,
                    title: `طلب مخصص رقم ${i}`,
                    description: `هذا وصف تفصيلي للطلب المخصص رقم ${i}.`,
                    budget: parseFloat((Math.random() * 200 + 50).toFixed(2)),
                    expected_delivery_days: Math.floor(Math.random() * 14) + 2,
                    skills: skillsList[i % skillsList.length],
                    status: getRandomStatus(),
                    rating_id: null,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });

            // ✅ ثم أنشئ الـ timeline وربطه بـ request.id
            await prisma.customRequestTimeline.create({
                data: {
                    request_id: request.id, // ✅ هذا هو الصحيح
                    actor_id: requester.user_id,
                    actor_role: 'owner',
                    action: 'request_created',
                },
            });

            console.log(`✅ Created CustomRequest #${i}`);
        } catch (error) {
            console.error(`❌ Error creating CustomRequest #${i}:`, error);
        }
    }
}

module.exports = main;
