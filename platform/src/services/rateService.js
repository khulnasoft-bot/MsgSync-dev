const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RateService {
    async updateRate(data) {
        return await prisma.rate.upsert({
            where: { prefix: data.prefix },
            update: {
                country: data.country,
                costPerSms: data.costPerSms,
                status: data.status || 'ACTIVE'
            },
            create: {
                country: data.country,
                prefix: data.prefix,
                costPerSms: data.costPerSms,
                status: data.status || 'ACTIVE'
            }
        });
    }

    async getRates() {
        return await prisma.rate.findMany({
            orderBy: { country: 'asc' }
        });
    }

    async lookupRate(phone) {
        // Simple prefix matching logic
        // In production, we'd use a more sophisticated tree search or regex
        const rates = await prisma.rate.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { prefix: 'desc' } // Match longest prefix first
        });

        const cleanPhone = phone.replace('+', '');
        const match = rates.find(r => cleanPhone.startsWith(r.prefix));

        return match || { country: 'Unknown', costPerSms: 0.1, prefix: 'default' };
    }

    async registerSenderId(organizationId, name, type) {
        return await prisma.senderId.create({
            data: {
                organizationId,
                name,
                type: type || 'ALPHANUMERIC',
                status: 'PENDING'
            }
        });
    }

    async approveSenderId(id) {
        return await prisma.senderId.update({
            where: { id },
            data: { status: 'APPROVED' }
        });
    }

    async listSenderIds(organizationId) {
        return await prisma.senderId.findMany({
            where: { organizationId }
        });
    }
}

module.exports = new RateService();
