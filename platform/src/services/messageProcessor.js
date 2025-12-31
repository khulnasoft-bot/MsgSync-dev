const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const providerService = require('./providerService');

/**
 * Processes a message from the queue and attempts delivery through a provider.
 * @param {string} messageId - The ID of the message to process.
 */
async function processMessage(messageId) {
    try {
        // 1. Fetch message from DB
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        if (!message) {
            throw new Error(`Message ${messageId} not found`);
        }

        if (message.status === 'cancelled') {
            console.log(`Message ${messageId} was cancelled, skipping.`);
            return;
        }

        // 2. Update status to 'sending'
        await prisma.message.update({
            where: { id: messageId },
            data: { status: 'sending' }
        });

        // 3. Select a provider (simple logic for now)
        const provider = await providerService.selectProvider(message);

        // 4. Attempt delivery
        const deliveryResult = await providerService.deliver(message, provider);

        // 5. Update message with result
        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: {
                status: deliveryResult.success ? 'sent' : 'failed',
                externalId: deliveryResult.externalId,
                provider: provider.name,
                error: deliveryResult.error,
                sentAt: deliveryResult.success ? new Date() : null
            }
        });

        // 6. Trigger webhook notification
        const webhookService = require('./webhookService');
        await webhookService.triggerStatusChange(updatedMessage);

        // 7. Trigger Integration Alerts (Slack/Discord)
        if (updatedMessage.status === 'failed' && updatedMessage.metadata?.slack_webhook_url) {
            const integrationService = require('./integrationService');
            await integrationService.sendSlackAlert(updatedMessage.metadata.slack_webhook_url, updatedMessage);
        }

        return deliveryResult;
    } catch (error) {
        console.error(`Error in processMessage for ${messageId}:`, error);

        // Final attempt to record the error in the DB
        try {
            await prisma.message.update({
                where: { id: messageId },
                data: {
                    status: 'failed',
                    error: error.message
                }
            });
        } catch (dbError) {
            console.error('Failed to update error status in DB:', dbError);
        }

        throw error;
    }
}

module.exports = {
    processMessage
};
