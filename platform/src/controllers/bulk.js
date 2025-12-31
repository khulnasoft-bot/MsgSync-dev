const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const campaignService = require('../services/campaignService');

/**
 * Controller for Contact Lists and Campaigns.
 */

async function createList(req, res) {
    const { name } = req.body;
    try {
        const list = await prisma.contactList.create({
            data: {
                name,
                apiKeyId: req.apiKey.id,
                organizationId: req.organization ? req.organization.id : null
            }
        });
        res.status(201).json({ status: 'success', data: list });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function addContacts(req, res) {
    const { listId } = req.params;
    const { contacts } = req.body; // Array of contact objects
    try {
        await campaignService.importContacts(listId, contacts);
        res.status(200).json({ status: 'success', message: 'Contacts imported successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function createCampaign(req, res) {
    const { name, template, contactListId, scheduledAt } = req.body;
    try {
        const campaign = await prisma.campaign.create({
            data: {
                name,
                template,
                contactListId,
                apiKeyId: req.apiKey.id,
                organizationId: req.organization ? req.organization.id : null,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                status: 'draft'
            }
        });
        res.status(201).json({ status: 'success', data: campaign });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function startCampaign(req, res) {
    const { id } = req.params;
    try {
        // Run in background
        campaignService.processCampaign(id).catch(err => console.error('Campaign background error:', err));
        res.status(202).json({ status: 'success', message: 'Campaign execution started' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

module.exports = {
    createList,
    addContacts,
    createCampaign,
    startCampaign
};
