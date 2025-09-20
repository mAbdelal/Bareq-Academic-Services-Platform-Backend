const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedWorkAttachments() {
    const works = await prisma.works.findMany({ take: 10 });

    if (works.length === 0) {
        console.error('❌ No works found. Please seed works first.');
        return;
    }

    const attachmentTypes = ['general', 'gallery_image', 'gallery_video', 'cover'];
    const fileExtensions = ['.jpg', '.png', '.pdf', '.docx', '.mp4', '.mov'];

    for (const work of works) {
        // Create 1-3 attachments per work
        const attachmentCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < attachmentCount; i++) {
            const fileType = attachmentTypes[Math.floor(Math.random() * attachmentTypes.length)];
            const fileExtension = fileExtensions[Math.floor(Math.random() * fileExtensions.length)];
            const fileName = `work_${work.id}_attachment_${i + 1}${fileExtension}`;

            try {
                await prisma.workAttachments.create({
                    data: {
                        work_id: work.id,
                        file_url: `images-1.jpg`,
                        file_name: fileName,
                        file_type: fileType,
                        uploaded_at: new Date(),
                    }
                });
                console.log(`✅ Created work attachment for work ${work.id}`);
            } catch (error) {
                console.error(`❌ Error creating work attachment for work ${work.id}:`, error);
            }
        }
    }

    console.log('✅ Work attachments seeded successfully.');
}

module.exports = seedWorkAttachments;
