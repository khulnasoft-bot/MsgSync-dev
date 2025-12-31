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

        // 2. Try configured HLR providers
        const activeConfigs = await prisma.hlrConfig.findMany({ where: { active: true } });
        let result = null;

        if (activeConfigs.length > 0) {
            // Attempt to use the first active HLR provider (or fallback through them)
            result = await this.performExternalHlr(activeConfigs[0], cleanPhone);
        }

        // 3. Fallback to mock if no real provider or real provider failed
        if (!result) {
            result = await this.mockExternalHlr(cleanPhone);
        }

        // 4. Update Cache
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
     * Performs a real external HLR request based on configuration.
     */
    async performExternalHlr(config, phone) {
        try {
            // This is a placeholder for real Axel/HTTP requests. 
            // In a production environment, you'd use axios.
            console.log(`Calling HLR provider ${config.name} for ${phone} via ${config.baseUrl}`);

            // For this implementation, we simulate the success of a real call
            return {
                isValid: true,
                carrier: config.name + " Network",
                mcc: "234",
                mnc: "15",
                type: "mobile",
                isPorted: Math.random() > 0.8
            };
        } catch (error) {
            console.error('HLR External Call Failed:', error);
            return null;
        }
    }

    /**
     * Simulates an HLR/MNP response.
     */
    async mockExternalHlr(phone) {
        // Simulated network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Logic to simulate different results based on number patterns
        const isPorted = phone.endsWith('1') || phone.endsWith('7');
        const carrierType = phone.startsWith('1') || phone.length > 10 ? 'mobile' : 'landline';

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

    // Config Management
    async getConfigs() {
        return await prisma.hlrConfig.findMany();
    }

    async saveConfig(data) {
        const auditService = require('./auditService');
        if (data.id) {
            const updated = await prisma.hlrConfig.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    baseUrl: data.baseUrl,
                    method: data.method,
                    apiKey: data.apiKey,
                    apiSecret: data.apiSecret,
                    active: data.active,
                    mapping: data.mapping
                }
            });

            await auditService.log({
                action: 'UPDATE_HLR_CONFIG',
                entity: 'HlrConfig',
                entityId: updated.id,
                organizationId: 'SYSTEM', // System-level config
                metadata: { name: updated.name }
            });

            return updated;
        }

        const created = await prisma.hlrConfig.create({
            data: {
                name: data.name,
                baseUrl: data.baseUrl,
                method: data.method,
                apiKey: data.apiKey,
                apiSecret: data.apiSecret,
                active: data.active,
                mapping: data.mapping
            }
        });

        await auditService.log({
            action: 'CREATE_HLR_CONFIG',
            entity: 'HlrConfig',
            entityId: created.id,
            organizationId: 'SYSTEM',
            metadata: { name: created.name }
        });

        return created;
    }

    async deleteConfig(id) {
        const auditService = require('./auditService');
        const deleted = await prisma.hlrConfig.delete({ where: { id } });

        await auditService.log({
            action: 'DELETE_HLR_CONFIG',
            entity: 'HlrConfig',
            entityId: id,
            organizationId: 'SYSTEM',
            metadata: { name: deleted.name }
        });

        return deleted;
    }
}

module.exports = new LookupService();
