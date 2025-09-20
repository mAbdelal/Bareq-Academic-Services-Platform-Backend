const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleComments = [
    "خدمة ممتازة وسريعة.",
    "لم يكن بالسرعة التي توقعتها.",
    "الجودة كانت رائعة وسأوصي به للآخرين.",
    "التواصل كان ضعيفًا قليلاً.",
    "أقدر الجهود المبذولة والاحترافية.",
    "التسليم كان متأخراً لكن العمل جيد.",
    "ممتاز، سأعود لاستخدام الخدمة مرة أخرى.",
    "العمل لم يكن مطابقًا للوصف.",
    "تجربة جيدة، لكن يمكن تحسين بعض التفاصيل.",
    "خدمة ممتازة، شكراً جزيلاً!"
];

async function seedRatings() {
    // Fetch academic users (raters)
    const academicUsers = await prisma.academicUsers.findMany();
    const services = await prisma.services.findMany();
    const customRequests = await prisma.customRequests.findMany();

    if (academicUsers.length < 1) {
        console.error('🚫 Not enough academic users to create ratings.');
        return;
    }

    const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getRandomRating = () => Math.floor(Math.random() * 5) + 1; // 1 to 5 stars

    for (let i = 0; i < 30; i++) {
        // Randomly decide to rate a service or a custom request
        const isServiceRating = Math.random() < 0.7; // 70% chance service, 30% custom request

        // Pick random rater
        const rater = getRandomItem(academicUsers);

        // Prepare common rating data
        const ratingValue = getRandomRating();
        const commentChance = Math.random();
        const comment = commentChance < 0.8 ? getRandomItem(sampleComments) : null;

        try {
            if (isServiceRating && services.length > 0) {
                // Service rating
                const service = getRandomItem(services);

                await prisma.ratings.create({
                    data: {
                        rater_id: rater.user_id,
                        service_id: service.id,
                        rating: ratingValue,
                        comment,
                    },
                });
            } else if (customRequests.length > 0) {
                // Custom request rating
                const customRequest = getRandomItem(customRequests);

                await prisma.ratings.create({
                    data: {
                        rater_id: rater.user_id,
                        custom_request_id: customRequest.id,
                        rating: ratingValue,
                        comment,
                    },
                });
            }
        } catch (error) {
            if (error.code === 'P2002') {
                // Unique constraint failed, skip duplicate
                continue;
            }
            console.error('❌ Error seeding rating:', error);
        }
    }

    console.log('✅ Ratings seeding complete.');
}


module.exports = seedRatings;