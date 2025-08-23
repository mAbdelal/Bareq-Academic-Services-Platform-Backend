const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Match your actual enum values
const directions = ['credit', 'debit'];
const reasons = [
    'deposit',
    'withdrawal',
    'custom_request_payment',
    'service_payment',
    'dispute_resolution'
];
const paymentMethods = ['Credit Card', 'PayPal', 'Bank Transfer'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seedTransactions() {
    const users = await prisma.academicUsers.findMany();
    const admins = await prisma.admins.findMany();
    const servicePurchases = await prisma.servicePurchases.findMany();
    const customRequests = await prisma.customRequests.findMany();
    const disputes = await prisma.disputes.findMany();

    if (users.length === 0) {
        console.error('🚫 No academic users found. Seed users first.');
        return;
    }

    let createdCount = 0;

    for (let i = 0; i < 20; i++) {
        const user = getRandomItem(users);
        const direction = getRandomItem(directions);
        const reason = getRandomItem(reasons);
        const admin = Math.random() < 0.3 ? getRandomItem(admins) : null;
        const payment_method = getRandomItem(paymentMethods);

        let service_purchase_id = null;
        let custom_request_id = null;
        let related_dispute_id = null;

        // Link logic based on reason
        if (reason === 'service_payment' && servicePurchases.length > 0) {
            service_purchase_id = getRandomItem(servicePurchases).id;
        } else if (reason === 'custom_request_payment' && customRequests.length > 0) {
            custom_request_id = getRandomItem(customRequests).id;
        } else if (reason === 'dispute_resolution' && disputes.length > 0) {
            related_dispute_id = getRandomItem(disputes).id;
        }

        const amount = parseFloat((Math.random() * 490 + 10).toFixed(2));

        try {
            await prisma.transactions.create({
                data: {
                    user_id: user.user_id,
                    admin_id: admin?.user_id || null,
                    amount,
                    direction,
                    reason,
                    payment_method,
                    service_purchase_id,
                    custom_request_id,
                    related_dispute_id,
                    description: `Transaction ${createdCount + 1} for reason ${reason}`,
                    created_at: new Date(),
                },
            });

            createdCount++;
        } catch (e) {
            console.error(`❌ Error creating transaction ${createdCount + 1}`, e);
        }
    }

    console.log(`✅ Seeded ${createdCount} transactions successfully.`);
}

module.exports = seedTransactions;
