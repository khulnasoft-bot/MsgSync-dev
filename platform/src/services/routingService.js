const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RoutingService {
    /**
     * Finds the most optimal providers for a message based on prefix and organization rules.
     */
    async getOptimalProviders(phone, organizationId = null) {
        const cleanPhone = phone.replace('+', '');

        // 1. Fetch all specific routing rules for this organization and prefix
        // We look for longest prefix matching rules
        const rules = await prisma.routingRule.findMany({
            where: {
                active: true,
                OR: [
                    { organizationId: organizationId },
                    { organizationId: null }
                ]
            },
            include: { provider: true },
            orderBy: [
                { prefix: 'desc' }, // Longest prefix match
                { priority: 'asc' }
            ]
        });

        // 2. Filter rules that match the current phone prefix
        // If no prefix-specific rules, we use global ones (prefix: null)
        let matchingProviders = rules
            .filter(rule => !rule.prefix || cleanPhone.startsWith(rule.prefix))
            .map(rule => rule.provider);

        // 3. Fallback to all active providers if no specific rules found
        if (matchingProviders.length === 0) {
            matchingProviders = await prisma.provider.findMany({
                where: { active: true },
                orderBy: { priority: 'asc' }
            });
        }

        // 4. Double check provider capabilities (if supportedPrefixes is set)
        matchingProviders = matchingProviders.filter(p => {
            if (!p.supportedPrefixes || p.supportedPrefixes.length === 0) return true;
            return p.supportedPrefixes.some(prefix => cleanPhone.startsWith(prefix));
        });

        return matchingProviders;
    }

    async createRule(data) {
        return await prisma.routingRule.create({ data });
    }

    async updateRule(id, data) {
        return await prisma.routingRule.update({
            where: { id },
            data
        });
    }

    async listRules() {
        return await prisma.routingRule.findMany({
            include: { provider: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async deleteRule(id) {
        return await prisma.routingRule.delete({ where: { id } });
    }
}

module.exports = new RoutingService();
