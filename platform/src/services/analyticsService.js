const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Service to aggregate platform-wide analytics.
 */
class AnalyticsService {
    async getMessageStats(apiKeyId = null, organizationId = null) {
        const where = {};
        if (apiKeyId) where.apiKeyId = apiKeyId;
        if (organizationId) where.organizationId = organizationId;

        const totalMessages = await prisma.message.count({ where });

        const statusCounts = await prisma.message.groupBy({
            by: ['status'],
            where,
            _count: {
                _all: true
            }
        });

        // Format into a friendly object
        const stats = {
            total: totalMessages,
            sent: 0,
            failed: 0,
            queued: 0,
            sending: 0,
            delivered: 0
        };

        statusCounts.forEach(item => {
            stats[item.status] = item._count._all;
        });

        // Calculate success rate
        const finished = stats.sent + stats.failed + stats.delivered;
        stats.successRate = finished > 0 ? ((stats.sent + stats.delivered) / finished * 100).toFixed(1) : 0;

        return stats;
    }

    /**
     * Gets delivery volume trends over the last 24 hours.
     */
    async getVolumeTrend(apiKeyId = null, organizationId = null) {
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const where = {
            createdAt: { gte: last24h }
        };
        if (apiKeyId) where.apiKeyId = apiKeyId;
        if (organizationId) where.organizationId = organizationId;

        // Simplified: group by hour
        const messages = await prisma.message.findMany({
            where,
            select: { createdAt: true, status: true }
        });

        const hourlyData = {};
        for (let i = 0; i < 24; i++) {
            const hour = new Date(Date.now() - i * 60 * 60 * 1000).getHours();
            hourlyData[hour] = { count: 0, success: 0 };
        }

        messages.forEach(m => {
            const h = m.createdAt.getHours();
            if (hourlyData[h]) {
                hourlyData[h].count++;
                if (m.status === 'sent' || m.status === 'delivered') hourlyData[h].success++;
            }
        });

        return Object.entries(hourlyData).map(([hour, data]) => ({
            hour: parseInt(hour),
            ...data
        })).sort((a, b) => a.hour - b.hour);
    }
}

module.exports = new AnalyticsService();
