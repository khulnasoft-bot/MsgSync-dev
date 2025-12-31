const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RateService {
    // --- Rate Plan Management ---

    async createRatePlan(data) {
        return await prisma.ratePlan.create({
            data: {
                name: data.name,
                description: data.description,
                currency: data.currency || 'USD',
                ownerId: data.ownerId,
                isPublic: data.isPublic || false
            }
        });
    }

    async listRatePlans(ownerId = null) {
        return await prisma.ratePlan.findMany({
            where: ownerId ? { ownerId } : { isPublic: true },
            include: { _count: { select: { rates: true } } }
        });
    }

    async assignPlanToOrganization(organizationId, planId) {
        return await prisma.organization.update({
            where: { id: organizationId },
            data: { ratePlanId: planId }
        });
    }

    // --- Rate Management ---

    async updateRate(planId, data) {
        const uniqueKey = {
            planId_prefix_mcc_mnc: {
                planId,
                prefix: data.prefix,
                mcc: data.mcc || '',
                mnc: data.mnc || ''
            }
        };

        return await prisma.rate.upsert({
            where: uniqueKey,
            update: {
                country: data.country,
                networkName: data.networkName,
                pricePerSms: data.pricePerSms,
                status: data.status || 'ACTIVE'
            },
            create: {
                planId,
                country: data.country,
                prefix: data.prefix,
                mcc: data.mcc || '',
                mnc: data.mnc || '',
                networkName: data.networkName,
                pricePerSms: data.pricePerSms,
                status: data.status || 'ACTIVE'
            }
        });
    }

    /**
     * Optimized batch import for large price lists
     */
    async importRates(planId, rates) {
        // Clear existing rates for this plan or merge? 
        // For trading, we often replace or perform a delta update.
        // Let's do a transactional upsert loop for now, 
        // but in high-perf trading we'd use raw SQL or bulk inserts.
        return await prisma.$transaction(
            rates.map(r => prisma.rate.upsert({
                where: {
                    planId_prefix_mcc_mnc: {
                        planId,
                        prefix: r.prefix,
                        mcc: r.mcc || '',
                        mnc: r.mnc || ''
                    }
                },
                update: {
                    country: r.country,
                    networkName: r.networkName,
                    pricePerSms: r.pricePerSms,
                    status: 'ACTIVE'
                },
                create: {
                    planId,
                    country: r.country,
                    prefix: r.prefix,
                    mcc: r.mcc || '',
                    mnc: r.mnc || '',
                    networkName: r.networkName,
                    pricePerSms: r.pricePerSms,
                    status: 'ACTIVE'
                }
            }))
        );
    }

    async getRatesForPlan(planId) {
        return await prisma.rate.findMany({
            where: { planId },
            orderBy: [{ country: 'asc' }, { prefix: 'asc' }]
        });
    }

    /**
     * Intelligent Rate Lookup for Charging
     */
    async lookupRateForOrganization(organizationId, phone, mcc = null, mnc = null) {
        const org = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { ratePlanId: true }
        });

        if (!org || !org.ratePlanId) {
            return { country: 'Default', pricePerSms: 0.05, prefix: '0' }; // High fallback safety
        }

        const cleanPhone = phone.replace('+', '');

        // Match logic:
        // 1. Exact MCC/MNC match for the specific plan
        // 2. Longest Prefix match for the specific plan
        // 3. Global fallback

        // Note: For extreme performance, this should use a Radix Tree or Redis cache
        const rates = await prisma.rate.findMany({
            where: { planId: org.ratePlanId, status: 'ACTIVE' },
            orderBy: [
                { pricePerSms: 'asc' } // Placeholder for selection logic
            ]
        });

        // 1. Try MCC/MNC match first if provided
        if (mcc && mnc) {
            const netMatch = rates.find(r => r.mcc === mcc && r.mnc === mnc);
            if (netMatch) return netMatch;
        }

        // 2. Prefix matching (Waterfall)
        // Sort rates by prefix length descending to match most specific first
        const sortedRates = rates.sort((a, b) => b.prefix.length - a.prefix.length);
        const match = sortedRates.find(r => cleanPhone.startsWith(r.prefix));

        return match || { country: 'Unknown', pricePerSms: 0.1, prefix: 'default' };
    }

    // --- Sender ID Management ---

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
