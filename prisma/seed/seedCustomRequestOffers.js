const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Fetch valid custom requests and providers
    const customRequests = await prisma.customRequests.findMany({
        where: {
            // Optionally filter by status if needed, e.g., status: 'pending'
        },
        take: 10,
    });

    const providers = await prisma.academicUsers.findMany({
        where: {
        },
        take: 10,
    });

    if (customRequests.length === 0 || providers.length === 0) {
        console.error('❌ تأكد من وجود بيانات في customRequests و academicUsers قبل التشغيل.');
        return;
    }

    const messages = [
        'أستطيع تنفيذ هذا الطلب خلال المدة المطلوبة.',
        'لدي خبرة في هذا المجال وسأقدم أفضل جودة.',
        'جاهز للعمل فوراً ويمكنني التسليم بسرعة.',
        'سأستخدم أحدث الأدوات والتقنيات.',
        'سأقدم لك تقريراً مفصلاً مع التسليم.',
    ];

    let successCount = 0;

    for (let i = 0; i < customRequests.length; i++) {
        const request = customRequests[i];
        const provider = providers[i % providers.length];

        try {
            // Ensure this provider hasn't already made an offer for this request
            const existingOffer = await prisma.customRequestOffers.findFirst({
                where: {
                    custom_request_id: request.id,
                    provider_id: provider.user_id
                }
            });

            if (existingOffer) {
                console.log(`⚠️ Offer already exists for request ${request.id} and provider ${provider.user_id}`);
                continue;
            }

            await prisma.customRequestOffers.create({
                data: {
                    custom_request_id: request.id,
                    provider_id: provider.user_id,
                    price: Math.floor(Math.random() * 200) + 50, // 50 - 250
                    delivery_days: Math.floor(Math.random() * 10) + 2, // 2-11 days
                    message: messages[i % messages.length],
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            });

            console.log(`✅ Seeded offer for request ${request.id} by provider ${provider.user_id}`);
            successCount++;

        } catch (error) {
            console.error(`❌ Failed to seed offer for request ${request.id} by provider ${provider.user_id}`, error);
        }
    }

    console.log(`🎯 Seeding completed: ${successCount} offers created.`);
}

module.exports = main;

