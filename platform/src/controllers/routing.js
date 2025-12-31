const routingService = require('../services/routingService');

exports.listRules = async (req, res) => {
    try {
        const rules = await routingService.listRules();
        res.json(rules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createRule = async (req, res) => {
    try {
        const rule = await routingService.createRule(req.body);
        res.status(201).json(rule);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateRule = async (req, res) => {
    try {
        const rule = await routingService.updateRule(req.params.id, req.body);
        res.json(rule);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteRule = async (req, res) => {
    try {
        await routingService.deleteRule(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
