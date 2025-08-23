const prisma = require("../config/prisma")
const { BadRequestError } = require('../utils/errors');

async function createServicePurchaseDispute({
    tx,
    service_purchase_id,
    complainant_id,
    respondent_id,
    description,
    complainant_note,
}) {
    if (!description || description.length < 10) {
        throw new BadRequestError('Description must be at least 10 characters long');
    }

    const purchase = await tx.servicePurchases.findUnique({
        where: { id: service_purchase_id },
        include: {
            buyer: true,
            service: {
                include: { provider: true },
            },
        },
    });

    if (!purchase) throw new NotFoundError('Service purchase not found');

    const buyer_id = purchase.buyer_id;
    const provider_id = purchase.service.provider_id;

    if (complainant_id !== buyer_id && complainant_id !== provider_id) {
        throw new BadRequestError('Complainant is not related to this purchase');
    }

    if (respondent_id !== buyer_id && respondent_id !== provider_id) {
        throw new BadRequestError('Respondent is not related to this purchase');
    }

    if (complainant_id === respondent_id) {
        throw new BadRequestError('Complainant and respondent cannot be the same');
    }

    const existingDispute = await tx.disputes.findFirst({
        where: { service_purchase_id },
    });

    if (existingDispute) {
        throw new BadRequestError('A dispute already exists for this purchase');
    }

    const dispute = await tx.disputes.create({
        data: {
            service_purchase_id,
            complainant_id,
            respondent_id,
            description,
            complainant_note: complainant_note || null,
            status: 'open',
        },
    });

    return dispute;
}

async function createCustomRequestDispute({
    tx,
    custom_request_id,
    complainant_id,
    respondent_id,
    description,
    complainant_note,
}) {
    if (!custom_request_id || !complainant_id || !respondent_id) {
        throw new BadRequestError('Missing required identifiers');
    }

    if (!description || description.length < 10) {
        throw new BadRequestError('Description must be at least 10 characters long');
    }

    const existingDispute = await tx.disputes.findFirst({
        where: { custom_request_id },
    });

    if (existingDispute) {
        throw new BadRequestError('A dispute already exists for this custom request');
    }

    const dispute = await tx.disputes.create({
        data: {
            custom_request_id,
            complainant_id,
            respondent_id,
            description,
            complainant_note: complainant_note || null,
            status: 'open',
        },
    });

    return dispute;
}



module.exports = {
    createServicePurchaseDispute,
    createCustomRequestDispute
};