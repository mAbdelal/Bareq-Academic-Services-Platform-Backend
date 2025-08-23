const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function extractJobTitles() {
    const jobTitles = await prisma.academicUsers.findMany({
        where: {
            job_title: {
                not: null,
            },
        },
        select: {
            job_title: true, // Assume this is Arabic
        },
    });

    const counts = {};
    for (const user of jobTitles) {
        const title_ar = user.job_title.trim();
        if (!title_ar) continue;
        counts[title_ar] = (counts[title_ar] || 0) + 1;
    }

    for (const [title_ar, usage_count] of Object.entries(counts)) {
        await prisma.jobTitles.upsert({
            where: { title_ar },
            update: {
                usage_count,
                updated_at: new Date(),
            },
            create: {
                title_ar,
                usage_count,
            },
        });
    }

    console.log("✅ Job titles (Arabic) have been denormalized and saved.");
}


module.exports = extractJobTitles;