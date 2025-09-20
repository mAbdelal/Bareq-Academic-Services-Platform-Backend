const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedOffersAttachments() {
    const offers = await prisma.customRequestOffers.findMany({ take: 10 });

    if (offers.length === 0) {
        console.error('❌ No custom request offers found. Please seed custom request offers first.');
        return;
    }

    const attachmentTypes = ['general', 'gallery_image', 'gallery_video', 'cover'];
    const fileExtensions = ['.jpg', '.png', '.pdf', '.docx', '.mp4', '.mov'];

    for (const offer of offers) {
        // Create 1-2 attachments per offer
        const attachmentCount = Math.floor(Math.random() * 2) + 1;

        for (let i = 0; i < attachmentCount; i++) {
            const fileType = attachmentTypes[Math.floor(Math.random() * attachmentTypes.length)];
            const fileExtension = fileExtensions[Math.floor(Math.random() * fileExtensions.length)];
            const fileName = `offer_${offer.id}_attachment_${i + 1}${fileExtension}`;

            try {
                await prisma.offersAttachments.create({
                    data: {
                        offer_id: offer.id,
                        file_url: `images-1.jpg`,
                        file_name: fileName,
                        file_type: fileType,
                        created_at: new Date(),
                    }
                });
                console.log(`✅ Created offer attachment for offer ${offer.id}`);
            } catch (error) {
                console.error(`❌ Error creating offer attachment for offer ${offer.id}:`, error);
            }
        }
    }

    console.log('✅ Offer attachments seeded successfully.');
}

module.exports = seedOffersAttachments;
