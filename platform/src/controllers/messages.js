const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const messageQueue = require('../queue/messageQueue');

/**
 * Sends a new message by adding it to the processing queue.
 */
async function sendMessage(req, res) {
    const { recipient, content, metadata } = req.body;

    if (!recipient || !content) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields: recipient, content'
        });
    }

    try {
        // 1. Save message to database with 'queued' status
        const message = await prisma.message.create({
            data: {
                recipient,
                content,
                metadata,
                status: 'queued',
                apiKeyId: req.apiKey ? req.apiKey.id : null
            }
        });

        // 2. Add to Bull queue for background processing
        await messageQueue.add({ messageId: message.id });

        res.status(202).json({
            status: 'success',
            data: message,
            message: 'Message accepted and queued for delivery'
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}

/**
 * Gets the status of a specific message.
 */
async function getMessageStatus(req, res) {
    const { id } = req.params;
    try {
        const message = await prisma.message.findUnique({
            where: { id }
        });

        if (!message) {
            return res.status(404).json({ status: 'error', message: 'Message not found' });
        }

        res.status(200).json({ status: 'success', data: message });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

/**
 * Lists messages with optional filtering.
 */
async function listMessages(req, res) {
    try {
        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.status(200).json({ status: 'success', data: messages });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

/**
 * Cancels a message if it hasn't been sent yet.
 */
async function cancelMessage(req, res) {
    const { id } = req.params;
    try {
        const message = await prisma.message.findUnique({
            where: { id }
        });

        if (!message) {
            return res.status(404).json({ status: 'error', message: 'Message not found' });
        }

        if (message.status !== 'queued') {
            return res.status(400).json({
                status: 'error',
                message: `Cannot cancel message in status: ${message.status}`
            });
        }

        const updatedMessage = await prisma.message.update({
            where: { id },
            data: { status: 'cancelled' }
        });

        res.status(200).json({ status: 'success', data: updatedMessage });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

module.exports = {
    sendMessage,
    getMessageStatus,
    listMessages,
    cancelMessage
};
