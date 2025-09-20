const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Get some custom requests
    const customRequests = await prisma.customRequests.findMany({
        take: 10,
        select: { id: true }
    });

    if (customRequests.length === 0) {
        console.error('❌ لا يوجد بيانات في customRequests. الرجاء تنفيذ seed لجدول customRequests أولاً.');
        return;
    }

    // Sample deliverables data
    const deliverablesData = [
        {
            message: 'تم تسليم المشروع المخصص بنجاح مع جميع المتطلبات.',
            requester_comment: 'شكراً على العمل الرائع!',
            is_accepted: true,
        },
        {
            message: 'تم رفع العرض التقديمي المطلوب للطلب المخصص.',
            requester_comment: 'العرض ممتاز.',
            is_accepted: true,
        },
        {
            message: 'تم إرسال الترجمة النهائية للطلب المخصص.',
            requester_comment: 'الترجمة دقيقة وسريعة.',
            is_accepted: true,
        },
        {
            message: 'تم تسليم تحليل البيانات للطلب المخصص.',
            requester_comment: 'التحليل مفصل وواضح.',
            is_accepted: true,
        },
        {
            message: 'تم تطوير التطبيق وتسليمه للطلب المخصص.',
            requester_comment: 'التطبيق يعمل بشكل ممتاز.',
            is_accepted: true,
        },
    ];

    // Seed deliverables for each custom request
    for (let i = 0; i < customRequests.length; i++) {
        const request = customRequests[i];
        const deliverable = deliverablesData[i % deliverablesData.length];

        try {
            await prisma.requestImplementationDeliverables.create({
                data: {
                    custom_request_id: request.id,
                    message: deliverable.message,
                    delivered_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * (customRequests.length - i)),
                    requester_comment: deliverable.requester_comment,
                    is_accepted: deliverable.is_accepted,
                    decision_at: deliverable.is_accepted
                        ? new Date(Date.now() - 1000 * 60 * 60 * 24 * (customRequests.length - i - 1))
                        : null,
                },
            });
            console.log(`✅ Seeded request implementation deliverable for custom request: ${request.id}`);
        } catch (error) {
            console.error(`❌ Failed to seed request implementation deliverable for custom request: ${request.id}`, error);
        }
    }
}

module.exports = main;
