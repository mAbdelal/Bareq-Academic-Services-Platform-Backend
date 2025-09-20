const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedServiceAttachments() {
    const services = await prisma.services.findMany({ take: 10 });

    if (services.length === 0) {
        console.error('❌ No services found. Please seed services first.');
        return;
    }

    const attachmentTypes = ['general', 'gallery_image', 'gallery_video', 'cover'];
    const fileExtensions = ['.jpg', '.png', '.pdf', '.docx', '.mp4', '.mov'];

    for (const service of services) {
        // Create 1-4 attachments per service
        const attachmentCount = Math.floor(Math.random() * 4) + 1;

        for (let i = 0; i < attachmentCount; i++) {
            const fileType = attachmentTypes[Math.floor(Math.random() * attachmentTypes.length)];
            const fileExtension = fileExtensions[Math.floor(Math.random() * fileExtensions.length)];
            const fileName = `service_${service.id}_attachment_${i + 1}${fileExtension}`;

            try {
                await prisma.serviceAttachments.create({
                    data: {
                        service_id: service.id,
                        file_url: `images-1.jpg`,
                        file_name: fileName,
                        file_type: fileType,
                        uploaded_at: new Date(),
                    }
                });
                console.log(`✅ Created service attachment for service ${service.id}`);
            } catch (error) {
                console.error(`❌ Error creating service attachment for service ${service.id}:`, error);
            }
        }
    }

    console.log('✅ Service attachments seeded successfully.');
}

module.exports = seedServiceAttachments;
