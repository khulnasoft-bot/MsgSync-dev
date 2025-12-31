const auditService = require('../services/auditService');

exports.getLogs = async (req, res) => {
    try {
        const organizationId = req.organization ? req.organization.id : null;
        if (!organizationId) {
            return res.status(403).json({ error: 'Organization context required' });
        }

        const logs = await auditService.getLogs(organizationId);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
