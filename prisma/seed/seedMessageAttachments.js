const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedMessageAttachments() {
    const messages = await prisma.messages.findMany({ take: 20 });

    if (messages.length === 0) {
        console.error('❌ No messages found. Please seed messages first.');
        return;
    }

    const fileExtensions = ['.jpg', '.png', '.pdf', '.docx', '.mp4', '.mov', '.zip', '.rar'];

    for (const message of messages) {
        // Create 0-2 attachments per message (not all messages have attachments)
        const hasAttachments = Math.random() < 0.3; // 30% chance of having attachments

        if (hasAttachments) {
            const attachmentCount = Math.floor(Math.random() * 2) + 1;

            for (let i = 0; i < attachmentCount; i++) {
                const fileExtension = fileExtensions[Math.floor(Math.random() * fileExtensions.length)];
                const fileName = `message_${message.id}_attachment_${i + 1}${fileExtension}`;

                try {
                    await prisma.messageAttachments.create({
                        data: {
                            message_id: message.id,
                            file_url: `images-1.jpg`,
                            file_name: fileName,
                            uploaded_at: new Date(),
                        }
                    });
                    console.log(`✅ Created message attachment for message ${message.id}`);
                } catch (error) {
                    console.error(`❌ Error creating message attachment for message ${message.id}:`, error);
                }
            }
        }
    }

    console.log('✅ Message attachments seeded successfully.');
}

module.exports = seedMessageAttachments;
