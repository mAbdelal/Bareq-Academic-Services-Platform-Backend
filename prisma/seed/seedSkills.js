const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function isEnglish(text) {
    return /^[A-Za-z0-9\s\-_,.()]+$/.test(text); // very basic detection
}

async function extractSkillsFromAcademicUsers() {
    console.log("🔍 Fetching academic users with skills...");
    const academicUsers = await prisma.academicUsers.findMany({
        where: {
            skills: {
                isEmpty: false
            }
        },
        select: {
            skills: true
        }
    });

    const skillMap = new Map();

    for (const user of academicUsers) {
        for (let skill of user.skills) {
            const original = skill.trim();
            if (!original) continue;

            // Normalize only for counting
            const key = isEnglish(original) ? original.toLowerCase() : original;

            if (!skillMap.has(key)) {
                skillMap.set(key, { name: original, count: 1 });
            } else {
                skillMap.get(key).count += 1;
            }
        }
    }

    console.log(`🛠 Found ${skillMap.size} unique normalized skills.`);

    for (const { name, count } of skillMap.values()) {
        try {
            await prisma.skills.upsert({
                where: { name },
                update: {
                    usage_count: { increment: count },
                    updated_at: new Date()
                },
                create: {
                    name,
                    usage_count: count,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            });

            console.log(`✅ Skill inserted/updated: ${name} (${count})`);
        } catch (err) {
            console.error(`❌ Failed to insert/update skill "${name}":`, err);
        }
    }

    console.log("🎉 Skill extraction complete!");
    await prisma.$disconnect();
}



module.exports = extractSkillsFromAcademicUsers;