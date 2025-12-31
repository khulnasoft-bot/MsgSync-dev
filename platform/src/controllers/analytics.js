const analyticsService = require('../services/analyticsService');

/**
 * Gets message delivery statistics.
 */
async function getStats(req, res) {
    try {
        // Optionally filter by API Key if user is not an admin
        const apiKeyId = req.apiKey ? req.apiKey.id : null;
        const organizationId = req.organization ? req.organization.id : null;
        const stats = await analyticsService.getMessageStats(apiKeyId, organizationId);
        res.status(200).json({ status: 'success', data: stats });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

/**
 * Gets message volume trends.
 */
async function getTrends(req, res) {
    try {
        const apiKeyId = req.apiKey ? req.apiKey.id : null;
        const organizationId = req.organization ? req.organization.id : null;
        const trends = await analyticsService.getVolumeTrend(apiKeyId, organizationId);
        res.status(200).json({ status: 'success', data: trends });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

module.exports = {
    getStats,
    getTrends
};
