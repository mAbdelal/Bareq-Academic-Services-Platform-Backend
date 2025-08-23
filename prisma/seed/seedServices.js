const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function seedServices() {
    // جلب بعض مزودي الخدمة من AcademicUsers
    const providers = await prisma.academicUsers.findMany({ take: 5 });
    if (providers.length === 0) {
        console.error('❌ لا يوجد AcademicUsers. الرجاء تنفيذ seed لجدول AcademicUsers أولاً.');
        return;
    }

    // جلب التصنيفات والفئات الفرعية
    const categories = await prisma.academicCategorys.findMany();
    if (categories.length === 0) {
        console.error('❌ لا يوجد AcademicCategorys. الرجاء تنفيذ seed لها أولاً.');
        return;
    }

    const subcategories = await prisma.academicSubcategorys.findMany();
    if (subcategories.length === 0) {
        console.error('❌ لا يوجد AcademicSubcategorys. الرجاء تنفيذ seed لها أولاً.');
        return;
    }

    const servicesData = [
        {
            provider_id: providers[0].user_id,
            academic_category_id: categories[0].id,
            academic_subcategory_id: subcategories[0]?.id || null,
            title: 'تصميم مواقع الإنترنت',
            description: 'خدمة تصميم وتطوير مواقع إنترنت احترافية باستخدام React وNode.js',
            price: 200,
            delivery_time_days: 7,
            is_active: true,
            skills: ['React', 'Node.js', 'Frontend', 'Backend'],
            rating: 4.7,
            ratings_count: 12,
            buyer_instructions: 'يرجى تزويدي بمتطلبات الموقع والصفحات المطلوبة.'
        },
        {
            provider_id: providers[1].user_id,
            academic_category_id: categories[1].id,
            academic_subcategory_id: subcategories[1]?.id || null,
            title: 'تدقيق أبحاث أكاديمية',
            description: 'مراجعة وتدقيق أبحاث طلابية وأكاديمية مع ضمان الجودة والدقة',
            price: 150,
            delivery_time_days: 5,
            is_active: true,
            skills: ['Research', 'Editing', 'Academic'],
            rating: 4.5,
            ratings_count: 8,
            buyer_instructions: 'أرسل البحث المطلوب تدقيقه بصيغة PDF أو Word.'
        },
        {
            provider_id: providers[2].user_id,
            academic_category_id: categories[0].id,
            academic_subcategory_id: subcategories[2]?.id || null,
            title: 'ترجمة الوثائق',
            description: 'خدمة ترجمة الوثائق من العربية إلى الإنجليزية وبالعكس بدقة عالية',
            price: 100,
            delivery_time_days: 3,
            is_active: true,
            skills: ['Translation', 'English', 'Arabic'],
            rating: 4.9,
            ratings_count: 20,
            buyer_instructions: 'أرسل الوثيقة المراد ترجمتها وحدد اللغة المطلوبة.'
        },
        {
            provider_id: providers[3].user_id,
            academic_category_id: categories[2].id,
            academic_subcategory_id: null,
            title: 'تطوير تطبيقات الموبايل',
            description: 'تصميم وتطوير تطبيقات موبايل باستخدام React Native و Node.js',
            price: 300,
            delivery_time_days: 10,
            is_active: true,
            skills: ['React Native', 'Mobile', 'Node.js'],
            rating: 4.2,
            ratings_count: 5,
            buyer_instructions: 'يرجى تزويدي بفكرة التطبيق والمزايا المطلوبة.'
        },
        {
            provider_id: providers[4].user_id,
            academic_category_id: categories[1].id,
            academic_subcategory_id: subcategories[3]?.id || null,
            title: 'تصميم عروض تقديمية',
            description: 'خدمة تصميم عروض تقديمية احترافية لأبحاثك ومشاريعك الجامعية',
            price: 80,
            delivery_time_days: 2,
            is_active: true,
            skills: ['PowerPoint', 'Design', 'Presentation'],
            rating: 4.8,
            ratings_count: 10,
            buyer_instructions: 'أرسل محتوى العرض أو النقاط الأساسية التي تريد عرضها.'
        },
    ];

    console.log('🚀 بدء إدخال البيانات في جدول الخدمات...');
    for (const service of servicesData) {
        await prisma.services.create({
            data: {
                provider_id: service.provider_id,
                academic_category_id: service.academic_category_id,
                academic_subcategory_id: service.academic_subcategory_id,
                title: service.title,
                description: service.description,
                price: service.price,
                delivery_time_days: service.delivery_time_days,
                is_active: service.is_active,
                skills: service.skills,
                rating: service.rating,
                ratings_count: service.ratings_count,
                buyer_instructions: service.buyer_instructions,
            },
        });
    }

    console.log('✅ تم إدخال الخدمات بنجاح.');
}

module.exports = seedServices;