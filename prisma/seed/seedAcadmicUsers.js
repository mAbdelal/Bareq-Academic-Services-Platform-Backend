const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Fetch users you want to seed as AcademicUsers (adjust filter or take count as needed)
    const users = await prisma.users.findMany({
        take: 10,
        select: { id: true, username: true, email: true },
    });

    // Sample academic data for different users (Arabic fields)
    const academicProfiles = [
        {
            academic_status: 'bachelor_student',
            university: 'جامعة فلسطين',
            faculty: 'كلية الهندسة',
            major: 'علوم الحاسوب',
            study_start_year: 2021,
            study_end_year: null,
            job_title: 'طالب',
            skills: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
            rating: 4.3,
            ratings_count: 5,
        },
        {
            academic_status: 'bachelor',
            university: 'جامعة بيرزيت',
            faculty: 'كلية العلوم',
            major: 'الأحياء',
            study_start_year: 2017,
            study_end_year: 2021,
            job_title: 'فني مختبر',
            skills: ['Lab Work', 'Data Analysis', 'Microscopy'],
            rating: 4.7,
            ratings_count: 15,
        },
        {
            academic_status: 'master',
            university: 'جامعة القدس',
            faculty: 'كلية الآداب',
            major: 'التاريخ',
            study_start_year: 2016,
            study_end_year: 2020,
            job_title: 'معلم تاريخ',
            skills: ['Writing', 'Research', 'Public Speaking'],
            rating: 4.1,
            ratings_count: 8,
        },
        {
            academic_status: 'phd_candidate',
            university: 'جامعة الخليل',
            faculty: 'كلية الهندسة',
            major: 'هندسة كهربائية',
            study_start_year: 2019,
            study_end_year: null,
            job_title: 'مساعد باحث',
            skills: ['Matlab', 'Simulink', 'Circuit Design'],
            rating: 4.6,
            ratings_count: 12,
        },
        {
            academic_status: 'bachelor_student',
            university: 'جامعة فلسطين التقنية',
            faculty: 'كلية الأعمال',
            major: 'تسويق',
            study_start_year: 2020,
            study_end_year: null,
            job_title: 'متدرب',
            skills: ['Digital Marketing', 'SEO', 'Content Creation'],
            rating: 4.0,
            ratings_count: 3,
        },
    ];

    // Loop over users and assign profile from academicProfiles array by cycling through
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const profile = academicProfiles[i % academicProfiles.length];

        try {
            await prisma.academicUsers.upsert({
                where: { user_id: user.id },
                update: {}, // no change on conflict
                create: {
                    user_id: user.id,
                    identity_document_url: `https://example.com/uploads/id/${user.username || user.id}.pdf`,
                    academic_status: profile.academic_status,
                    university: profile.university,
                    faculty: profile.faculty,
                    major: profile.major,
                    study_start_year: profile.study_start_year,
                    study_end_year: profile.study_end_year,
                    job_title: profile.job_title,
                    skills: profile.skills,
                    rating: profile.rating,
                    ratings_count: profile.ratings_count,
                },
            });
            console.log(`Seeded academic user for user_id: ${user.id}`);
        } catch (error) {
            console.error(`Failed to seed academic user for user_id: ${user.id}`, error);
        }
    }
}

module.exports = main;