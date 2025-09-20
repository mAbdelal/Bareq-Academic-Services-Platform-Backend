const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Get some service purchases
    const purchases = await prisma.servicePurchases.findMany({
        take: 10,
        select: { id: true }
    });

    if (purchases.length === 0) {
        console.error('❌ لا يوجد بيانات في servicePurchases. الرجاء تنفيذ seed لجدول servicePurchases أولاً.');
        return;
    }

    // Sample deliverables data
    const deliverablesData = [
        {
            message: 'تم تسليم المشروع بنجاح مع جميع المتطلبات.',
            buyer_comment: 'شكراً على العمل الرائع!',
            is_accepted: true,
        },
        {
            message: 'تم رفع العرض التقديمي المطلوب.',
            buyer_comment: 'العرض ممتاز.',
            is_accepted: true,
        },
        {
            message: 'تم إرسال الترجمة النهائية.',
            buyer_comment: 'الترجمة دقيقة وسريعة.',
            is_accepted: true,
        },
        {
            message: 'تم تسليم تحليل البيانات.',
            buyer_comment: 'التحليل مفصل وواضح.',
            is_accepted: true,
        },
        {
            message: 'تم تطوير التطبيق وتسليمه.',
            buyer_comment: 'التطبيق يعمل بشكل ممتاز.',
            is_accepted: true,
        },
    ];

    // Seed deliverables for each purchase
    for (let i = 0; i < purchases.length; i++) {
        const purchase = purchases[i];
        const deliverable = deliverablesData[i % deliverablesData.length];

        try {
            await prisma.servicePurchaseDeliverables.create({
                data: {
                    purchase_id: purchase.id,
                    message: deliverable.message,
                    delivered_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * (purchases.length - i)),
                    buyer_comment: deliverable.buyer_comment,
                    is_accepted: deliverable.is_accepted,
                    decision_at: deliverable.is_accepted
                        ? new Date(Date.now() - 1000 * 60 * 60 * 24 * (purchases.length - i - 1))
                        : null,
                },
            });
            console.log(`✅ Seeded deliverable for purchase: ${purchase.id}`);
        } catch (error) {
            console.error(`❌ Failed to seed deliverable for purchase: ${purchase.id}`, error);
        }
    }
}

module.exports = main;