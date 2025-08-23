const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const notificationsData = [
    {
        title: 'مرحباً بك في منصتنا',
        message: 'شكراً لتسجيلك معنا. نتمنى لك تجربة رائعة!',
    },
    {
        title: 'تنبيه جديد',
        message: 'لديك طلب جديد يحتاج إلى مراجعتك.',
    },
    {
        title: 'تحديث الخدمة',
        message: 'تم تحديث خدمتك بنجاح.',
    },
    {
        title: 'تمت الموافقة على طلبك',
        message: 'طلبك قيد التنفيذ الآن.',
    },
    {
        title: 'تذكير بموعد',
        message: 'لا تنسَ الموعد النهائي لتسليم المشروع.',
    },
    {
        title: 'رسالة جديدة',
        message: 'لقد تلقيت رسالة جديدة من الدعم الفني.',
    },
];

async function seedNotifications() {
    const users = await prisma.users.findMany();

    if (users.length === 0) {
        console.error('🚫 No users found. Please seed users first.');
        return;
    }

    for (const user of users) {
        // Assign 2 random notifications to each user
        for (let i = 0; i < 2; i++) {
            const randomNotification = notificationsData[Math.floor(Math.random() * notificationsData.length)];

            await prisma.notifications.create({
                data: {
                    user_id: user.id,
                    title: randomNotification.title,
                    message: randomNotification.message,
                    is_read: Math.random() < 0.5, // random read/unread
                    created_at: new Date(Date.now() - Math.floor(Math.random() * 1000000000)), // random past time
                },
            });
        }
    }

    console.log('✅ Notifications seeded successfully.');
}

module.exports = seedNotifications;