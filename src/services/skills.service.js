const prisma= require("../config/prisma")

async function incrementSkillsUsageCount(skills) {
    if (!Array.isArray(skills) || skills.length === 0) return;

    await Promise.all(
        skills.map(async (skillName) => {
            await prisma.skills.upsert({
                where: { name: skillName },
                update: { usage_count: { increment: 1 } },
                create: { name: skillName, usage_count: 1 }
            });
        })
    );
}


module.exports = { incrementSkillsUsageCount };
