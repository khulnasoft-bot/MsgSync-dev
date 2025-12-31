const rateService = require('../services/rateService');

exports.listRates = async (req, res) => {
    try {
        const rates = await rateService.getRates();
        res.json(rates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRate = async (req, res) => {
    try {
        const rate = await rateService.updateRate(req.body);
        res.status(201).json(rate);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.lookupExchange = async (req, res) => {
    try {
        const info = await rateService.lookupRate(req.query.phone);
        res.json(info);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.requestSenderId = async (req, res) => {
    try {
        const { organizationId, name, type } = req.body;
        const sid = await rateService.registerSenderId(organizationId, name, type);
        res.status(201).json(sid);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getSenderIds = async (req, res) => {
    try {
        const list = await rateService.listSenderIds(req.params.orgId);
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.approveSenderId = async (req, res) => {
    try {
        const sid = await rateService.approveSenderId(req.params.id);
        res.json(sid);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
