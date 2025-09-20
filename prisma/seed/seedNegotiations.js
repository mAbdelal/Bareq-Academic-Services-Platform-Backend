const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedNegotiations() {
    const services = await prisma.services.findMany({ take: 10 });
    const academicUsers = await prisma.academicUsers.findMany({ take: 20 });

    if (services.length === 0 || academicUsers.length === 0) {
        console.error('❌ No services or academic users found. Please seed them first.');
        return;
    }

    const statuses = ['pending', 'agreed'];

    for (let i = 0; i < 10; i++) {
        const service = services[i % services.length];
        const buyer = academicUsers[Math.floor(Math.random() * academicUsers.length)];
        const provider = academicUsers[Math.floor(Math.random() * academicUsers.length)];

        // Make sure buyer and provider are different
        if (buyer.user_id === provider.user_id) {
            continue;
        }

        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date within last 30 days

        try {
            await prisma.negotiations.create({
                data: {
                    service_id: service.id,
                    buyer_id: buyer.user_id,
                    provider_id: provider.user_id,
                    status: status,
                    created_at: createdAt,
                    updated_at: createdAt,
                }
            });
            console.log(`✅ Created negotiation for service ${service.id} between buyer ${buyer.user_id} and provider ${provider.user_id}`);
        } catch (error) {
            console.error(`❌ Error creating negotiation for service ${service.id}:`, error);
        }
    }

    console.log('✅ Negotiations seeded successfully.');
}

module.exports = seedNegotiations;
