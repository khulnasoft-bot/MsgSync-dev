const lookupService = require('../services/lookupService');

exports.getLookup = async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) return res.status(400).json({ error: 'Phone number is required' });

        const result = await lookupService.performLookup(phone);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.listRecent = async (req, res) => {
    try {
        const list = await lookupService.listRecentLookups();
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
