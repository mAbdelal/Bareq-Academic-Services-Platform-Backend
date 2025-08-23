const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleMessagesArabic = [
    "مرحبًا، أحتاج إلى بعض المساعدة في الخدمة.",
    "هل يمكنك تقديم المزيد من التفاصيل؟",
    "بالطبع، ما الذي تحتاجه بالضبط؟",
    "أبحث عن حل مخصص.",
    "شكرًا على ردك السريع.",
    "متى يمكنك تسليم المشروع؟",
    "أود إضافة بعض الميزات الإضافية.",
    "دعنا نحدد موعدًا للاجتماع.",
    "يرجى مشاركة الملفات.",
    "أنا راضٍ عن التقدم حتى الآن."
];

async function seedMessages() {
    const chats = await prisma.chats.findMany({ take: 10 });
    const users = await prisma.users.findMany({ take: 10 });

    if (chats.length === 0 || users.length === 0) {
        console.error('🚫 Missing data: Make sure both chats and users are seeded.');
        return;
    }

    for (const chat of chats) {
        // Double the original range: between 6 and 14 messages
        const messagesCount = Math.floor(Math.random() * 9) + 6;

        for (let i = 0; i < messagesCount; i++) {
            const sender = users[Math.floor(Math.random() * users.length)];
            const content = sampleMessagesArabic[Math.floor(Math.random() * sampleMessagesArabic.length)];

            try {
                await prisma.messages.create({
                    data: {
                        chat_id: chat.id,
                        sender_id: sender.id,
                        content,
                        created_at: new Date(Date.now() - (messagesCount - i) * 60000)
                    }
                });
            } catch (error) {
                console.error(`❌ Failed to create message in chat ${chat.id}`, error);
            }
        }
        console.log(`✅ Created ${messagesCount} Arabic messages for chat ${chat.id}`);
    }
}

module.exports = seedMessages;