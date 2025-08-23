const { PrismaClient, DisputeStatus } = require('@prisma/client');
const prisma = new PrismaClient();

const disputeStatuses = [
    DisputeStatus.open,
    DisputeStatus.under_review,
    DisputeStatus.resolved,
    DisputeStatus.rejected,
];

const sampleDescriptions = [
    'الخدمة لم تكن كما هو موصوف.',
    'تم التأخير في التسليم دون سبب مقنع.',
    'المبلغ المدفوع لم يتم استرداده.',
    'التواصل مع المزود كان صعبًا للغاية.',
    'المنتج النهائي كان غير مرضي.',
    'تضارب في شروط الاتفاق بين الطرفين.'
];

const sampleSolutions = [
    'تم الاتفاق على إعادة العمل.',
    'تم رد المبلغ للعميل.',
    'تم حل النزاع ودياً.',
    'لا توجد تسوية حتى الآن.',
    null // لا يوجد حل حتى الآن
];

async function seedDisputes() {
    const academicUsers = await prisma.academicUsers.findMany();
    const servicePurchases = await prisma.servicePurchases.findMany();
    const customRequests = await prisma.customRequests.findMany();

    if (academicUsers.length < 2) {
        console.error('🚫 Not enough academic users for disputes.');
        return;
    }

    const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getRandomDistinctUsers = () => {
        let user1 = getRandomItem(academicUsers);
        let user2;
        do {
            user2 = getRandomItem(academicUsers);
        } while (user1.user_id === user2.user_id);
        return [user1, user2];
    };

    let createdCount = 0;

    for (let i = 0; i < 20; i++) {
        const [complainant, respondent] = getRandomDistinctUsers();
        const isServicePurchaseDispute = Math.random() < 0.5; // 50% احتمال النزاع على شراء خدمة

        let disputeData = {
            complainant_id: complainant.user_id,
            respondent_id: respondent.user_id,
            description: getRandomItem(sampleDescriptions),
            complainant_note: Math.random() < 0.5 ? 'أرجو النظر في هذه المسألة بشكل عاجل.' : null,
            status: getRandomItem(disputeStatuses),
            solution: getRandomItem(sampleSolutions),
            created_at: new Date(),
            updated_at: new Date(),
            resolved_by_admin_id: null,
            admin_decision_at: null
        };

        // الربط مع custom request أو service purchase
        if (isServicePurchaseDispute && servicePurchases.length > 0) {
            const purchase = getRandomItem(servicePurchases);
            // تأكد من عدم وجود نزاع مرتبط به مسبقاً (لأن الحقل unique)
            const exists = await prisma.disputes.findFirst({
                where: { service_purchase_id: purchase.id }
            });
            if (exists) continue;

            disputeData.service_purchase_id = purchase.id;
            disputeData.custom_request_id = null;
        } else if (customRequests.length > 0) {
            const customRequest = getRandomItem(customRequests);
            const exists = await prisma.disputes.findFirst({
                where: { custom_request_id: customRequest.id }
            });
            if (exists) continue;

            disputeData.custom_request_id = customRequest.id;
            disputeData.service_purchase_id = null;
        } else {
            continue; // لا يوجد مصادر للربط
        }

        try {
            await prisma.disputes.create({ data: disputeData });
            createdCount++;
        } catch (error) {
            console.error('❌ Error seeding dispute:', error);
        }
    }

    console.log(`✅ Disputes seeding complete. (${createdCount} inserted)`);
}

module.exports = seedDisputes;
