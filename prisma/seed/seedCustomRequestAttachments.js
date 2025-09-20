const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedCustomRequestAttachments() {
    const customRequests = await prisma.customRequests.findMany({ take: 10 });

    if (customRequests.length === 0) {
        console.error('❌ No custom requests found. Please seed custom requests first.');
        return;
    }

    const attachmentTypes = ['general', 'gallery_image', 'gallery_video', 'cover'];
    const fileExtensions = ['.jpg', '.png', '.pdf', '.docx', '.mp4', '.mov'];

    for (const request of customRequests) {
        // Create 1-3 attachments per custom request
        const attachmentCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < attachmentCount; i++) {
            const fileType = attachmentTypes[Math.floor(Math.random() * attachmentTypes.length)];
            const fileExtension = fileExtensions[Math.floor(Math.random() * fileExtensions.length)];
            const fileName = `custom_request_${request.id}_attachment_${i + 1}${fileExtension}`;

            try {
                await prisma.customRequestAttachments.create({
                    data: {
                        custom_request_id: request.id,
                        file_url: `images-1.jpg`,
                        file_name: fileName,
                        file_type: fileType,
                        uploaded_at: new Date(),
                    }
                });
                console.log(`✅ Created custom request attachment for request ${request.id}`);
            } catch (error) {
                console.error(`❌ Error creating custom request attachment for request ${request.id}:`, error);
            }
        }
    }

    console.log('✅ Custom request attachments seeded successfully.');
}

module.exports = seedCustomRequestAttachments;
