const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedChats() {
    const servicePurchases = await prisma.servicePurchases.findMany({ take: 10 });
    const customRequestOffers = await prisma.customRequestOffers.findMany({ take: 10 });
    const negotiations = await prisma.negotiations.findMany({ take: 10 });

    if (servicePurchases.length === 0 && customRequestOffers.length === 0 && negotiations.length === 0) {
        console.error('🚫 Missing data: Seed ServicePurchases, CustomRequestOffers, or Negotiations first.');
        return;
    }

    // Create chats for service purchases
    for (const purchase of servicePurchases) {
        try {
            // Check if a chat already exists for this service purchase
            const existingChat = await prisma.chats.findUnique({
                where: { service_purchase_id: purchase.id }
            });
            if (!existingChat) {
                // Get buyer and provider from the purchase
                const service = await prisma.services.findUnique({
                    where: { id: purchase.service_id },
                    select: { provider_id: true }
                });

                if (service) {
                    await prisma.chats.create({
                        data: {
                            service_purchase_id: purchase.id,
                            first_part_id: purchase.buyer_id,
                            second_part_id: service.provider_id,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }
                    });
                    console.log(`✅ Created chat for service purchase ${purchase.id}`);
                }
            }
        } catch (error) {
            console.error(`❌ Error creating chat for service purchase ${purchase.id}:`, error);
        }
    }

    // Create chats for custom request offers
    for (const offer of customRequestOffers) {
        try {
            // Check if a chat already exists for this offer
            const existingChat = await prisma.chats.findUnique({
                where: { offer_id: offer.id }
            });
            if (!existingChat) {
                // Get requester from the custom request
                const request = await prisma.customRequests.findUnique({
                    where: { id: offer.custom_request_id },
                    select: { requester_id: true }
                });

                if (request) {
                    await prisma.chats.create({
                        data: {
                            offer_id: offer.id,
                            first_part_id: request.requester_id,
                            second_part_id: offer.provider_id,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }
                    });
                    console.log(`✅ Created chat for offer ${offer.id}`);
                }
            }
        } catch (error) {
            console.error(`❌ Error creating chat for offer ${offer.id}:`, error);
        }
    }

    // Create chats for negotiations
    for (const negotiation of negotiations) {
        try {
            // Check if a chat already exists for this negotiation
            const existingChat = await prisma.chats.findUnique({
                where: { negotiation_id: negotiation.id }
            });
            if (!existingChat) {
                await prisma.chats.create({
                    data: {
                        negotiation_id: negotiation.id,
                        first_part_id: negotiation.buyer_id,
                        second_part_id: negotiation.provider_id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    }
                });
                console.log(`✅ Created chat for negotiation ${negotiation.id}`);
            }
        } catch (error) {
            console.error(`❌ Error creating chat for negotiation ${negotiation.id}:`, error);
        }
    }
}

module.exports = seedChats;
