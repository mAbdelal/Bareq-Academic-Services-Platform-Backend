const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const services = await prisma.services.findMany({ take: 5 });
    const buyers = await prisma.academicUsers.findMany({ take: 10 });

    if (services.length === 0 || buyers.length === 0) {
        console.error('❌ تأكد من وجود بيانات في services و academicUsers قبل التشغيل.');
        return;
    }

    const statuses = [
        'pending',
        'in_progress',
        'submitted',
        'disputed_by_provider',
        'disputed_by_buyer',
        'completed',
        'buyer_rejected',
        'provider_rejected'
    ]; 

    const statusToActionMap = {
        pending: { action: 'purchase', role: 'buyer' },
        provider_rejected: { action: 'Provider_reject', role: 'provider' },
        in_progress: { action: 'Provider_accept', role: 'provider' },
        submitted: { action: 'submit', role: 'provider' },
        disputed_by_provider: { action: 'dispute_provider', role: 'provider' },
        disputed_by_buyer: { action: 'dispute_buyer', role: 'buyer' },
        buyer_rejected: { action: 'buyer_reject', role: 'buyer' },
        completed: { action: 'complete', role: 'buyer' }
    };

    for (let i = 0; i < buyers.length; i++) {
        const buyer = buyers[i];
        const service = services[i % services.length];
        const status = statuses[i % statuses.length];
        const timestamp = new Date(Date.now() - 1000 * 60 * 60 * 24 * (buyers.length - i));

        try {
            const purchase = await prisma.servicePurchases.create({
                data: {
                    service_id: service.id,
                    buyer_id: buyer.user_id,
                    status,
                    created_at: timestamp
                }
            });

            const timelineData = statusToActionMap[status];
            const actor_id = timelineData.role === 'buyer'
                ? buyer.user_id
                : service.owner_id;

            if (!actor_id) {
                console.warn(`⚠️ Skipping timeline for purchase ${purchase.id}: missing service.owner_id`);
                continue;
            }

            await prisma.purchaseTimeline.create({
                data: {
                    purchase_id: purchase.id,
                    actor_id,
                    actor_role: timelineData.role,
                    action: timelineData.action,
                    comment: `Auto-seeded action: ${timelineData.action}`,
                    created_at: timestamp
                }
            });

            console.log(`✅ Seeded purchase ${purchase.id} with status "${status}" and timeline action "${timelineData.action}"`);
        } catch (error) {
            console.error(`❌ Failed to seed for buyer ${buyer.user_id}, service ${service.id}`, error);
        }
    }
}

module.exports = main;
