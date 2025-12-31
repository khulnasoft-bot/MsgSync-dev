const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class LookupService {
    /**
     * Performs an HLR/MNP lookup for a phone number.
     * Uses cache if available and fresh (less than 30 days).
     */
    async performLookup(phone) {
        const cleanPhone = phone.replace('+', '');

        // 1. Check Cache
        const cached = await prisma.lookup.findUnique({
            where: { phone: cleanPhone }
        });

        const cacheExpiry = 30 * 24 * 60 * 60 * 1000; // 30 days
        if (cached && (Date.now() - new Date(cached.lastCheckedAt).getTime() < cacheExpiry)) {
            return cached;
        }

        // 2. Mock HLR External Request (Twilio Lookup / Nexmo Insight / SS7 SRI)
        // In a real implementation, you'd call a provider like Twilio Lookup or perform an SS7 SRI_SM
        const result = await this.mockExternalHlr(cleanPhone);

        // 3. Update Cache
        return await prisma.lookup.upsert({
            where: { phone: cleanPhone },
            update: {
                isValid: result.isValid,
                carrier: result.carrier,
                mcc: result.mcc,
                mnc: result.mnc,
                type: result.type,
                isPorted: result.isPorted,
                lastCheckedAt: new Date()
            },
            create: {
                phone: cleanPhone,
                isValid: result.isValid,
                carrier: result.carrier,
                mcc: result.mcc,
                mnc: result.mnc,
                type: result.type,
                isPorted: result.isPorted
            }
        });
    }

    /**
     * Simulates an HLR/MNP response.
     */
    async mockExternalHlr(phone) {
        // Simulated network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Logic to simulate different results based on number patterns
        const isPorted = phone.endsWith('1') || phone.endsWith('7');
        const carrierType = phone.startsWith('1') ? 'mobile' : 'landline';

        const mobileCarriers = ['Vodafone', 'T-Mobile', 'AT&T', 'Orange', 'Telefónica'];
        const carrier = carrierType === 'mobile'
            ? mobileCarriers[Math.floor(Math.random() * mobileCarriers.length)]
            : 'Fixed Line Operator';

        return {
            isValid: true,
            carrier: carrier,
            mcc: phone.substring(0, 3),
            mnc: phone.substring(3, 5),
            type: carrierType,
            isPorted: isPorted
        };
    }

    async listRecentLookups() {
        return await prisma.lookup.findMany({
            orderBy: { lastCheckedAt: 'desc' },
            take: 100
        });
    }
}

module.exports = new LookupService();
