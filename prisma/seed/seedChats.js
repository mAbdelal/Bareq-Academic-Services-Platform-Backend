const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedChats() {
    const services = await prisma.services.findMany({ take: 10 });
    const customRequests = await prisma.customRequests.findMany({ take: 10 });

    if (services.length === 0 && customRequests.length === 0) {
        console.error('🚫 Missing data: Seed Services or CustomRequests first.');
        return;
    }

    // Create chats for services
    for (const service of services) {
        try {
            // Check if a chat already exists for this service
            const existingChat = await prisma.chats.findUnique({
                where: { service_id: service.id }
            });
            if (!existingChat) {
                await prisma.chats.create({
                    data: {
                        service_id: service.id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    }
                });
                console.log(`✅ Created chat for service ${service.id}`);
            }
        } catch (error) {
            console.error(`❌ Error creating chat for service ${service.id}:`, error);
        }
    }

    // Create chats for custom requests
    for (const request of customRequests) {
        try {
            // Check if a chat already exists for this custom request
            const existingChat = await prisma.chats.findUnique({
                where: { custom_request_id: request.id }
            });
            if (!existingChat) {
                await prisma.chats.create({
                    data: {
                        custom_request_id: request.id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    }
                });
                console.log(`✅ Created chat for custom request ${request.id}`);
            }
        } catch (error) {
            console.error(`❌ Error creating chat for custom request ${request.id}:`, error);
        }
    }
}

module.exports = seedChats;
