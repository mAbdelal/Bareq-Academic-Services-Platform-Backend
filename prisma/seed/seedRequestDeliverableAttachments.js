const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRequestDeliverableAttachments() {
    const deliverables = await prisma.requestImplementationDeliverables.findMany({ take: 10 });

    if (deliverables.length === 0) {
        console.error('❌ No request implementation deliverables found. Please seed request implementation deliverables first.');
        return;
    }

    const fileExtensions = ['.jpg', '.png', '.pdf', '.docx', '.zip', '.rar'];

    for (const deliverable of deliverables) {
        // Create 1-3 attachments per deliverable
        const attachmentCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < attachmentCount; i++) {
            const fileExtension = fileExtensions[Math.floor(Math.random() * fileExtensions.length)];
            const fileName = `request_deliverable_${deliverable.id}_attachment_${i + 1}${fileExtension}`;

            try {
                await prisma.requestDeliverableAttachments.create({
                    data: {
                        deliverable_id: deliverable.id,
                        file_url: `images-1.jpg`,
                        file_name: fileName,
                        file_type: 'general',
                        created_at: new Date(),
                    }
                });
                console.log(`✅ Created request deliverable attachment for deliverable ${deliverable.id}`);
            } catch (error) {
                console.error(`❌ Error creating request deliverable attachment for deliverable ${deliverable.id}:`, error);
            }
        }
    }

    console.log('✅ Request deliverable attachments seeded successfully.');
}

module.exports = seedRequestDeliverableAttachments;
