const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SecurityService {
    /**
     * Checks if a message request is valid based on security rules.
     */
    async validateRequest(apiKey, organization, recipient, content, remoteIp) {
        // 1. IP Whitelisting
        if (apiKey.allowedIps && apiKey.allowedIps.length > 0) {
            if (!apiKey.allowedIps.includes(remoteIp)) {
                return { valid: false, reason: 'IP_NOT_ALLOWED' };
            }
        }

        // 2. Spending Limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const spentToday = await prisma.transaction.aggregate({
            where: {
                organizationId: organization.id,
                type: 'DEBIT',
                createdAt: { gte: today }
            },
            _sum: { amount: true }
        });

        const totalSpent = spentToday._sum.amount || 0;
        if (parseFloat(totalSpent) >= parseFloat(organization.maxDailySpend)) {
            return { valid: false, reason: 'DAILY_SPEND_LIMIT_REACHED' };
        }

        // 3. Simple Spam/Fraud Detection
        const isSpam = this.checkForSpam(content);
        if (isSpam) {
            return { valid: false, reason: 'CONTENT_REJECTED_SPAM' };
        }

        return { valid: true };
    }

    /**
     * Basic pattern matching for spam/phishing keywords.
     */
    checkForSpam(content) {
        const blacklist = [
            'lottery', 'inheritance', 'bank account suspended',
            'click here to claim', 'urgent action required',
            'unusual activity detected', 'verify your identity now'
        ];

        const lowerContent = content.toLowerCase();
        return blacklist.some(term => lowerContent.includes(term));
    }

    async updateOrganizationSecurity(orgId, maxDailySpend) {
        return await prisma.organization.update({
            where: { id: orgId },
            data: { maxDailySpend }
        });
    }

    async updateApiKeySecurity(keyId, data) {
        return await prisma.apiKey.update({
            where: { id: keyId },
            data: {
                allowedIps: data.allowedIps,
                rateLimit: data.rateLimit
            }
        });
    }
}

module.exports = new SecurityService();
