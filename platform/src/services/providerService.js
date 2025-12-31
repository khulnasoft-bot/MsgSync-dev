const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Service to handle interaction with SMS providers.
 */
class ProviderService {
    /**
     * Selects the best provider for a given message.
     */
    async selectProvider(message) {
        // Fetch active providers ordered by priority
        const providers = await prisma.provider.findMany({
            where: { active: true },
            orderBy: { priority: 'asc' }
        });

        if (providers.length === 0) {
            // Fallback to a mock provider if none configured
            return {
                name: 'mock-provider',
                type: 'generic-http',
                config: { url: 'https://api.mock-provider.com/v1/sms' }
            };
        }

        return providers[0];
    }

    /**
     * Delivers a message through the selected provider.
     */
    async deliver(message, provider) {
        console.log(`Delivering message ${message.id} via ${provider.name} (${provider.type})`);

        if (provider.type === 'twilio') {
            const TwilioProvider = require('./providers/twilio');
            const twilioProvider = new TwilioProvider(provider.config);
            return await twilioProvider.send(message);
        }

        if (provider.type === 'smpp') {
            const SMPPProvider = require('./providers/smpp');
            const smppProvider = new SMPPProvider(provider.config);
            try {
                await smppProvider.connect();
                const result = await smppProvider.sendMessage(message.recipient, message.content, message.id);
                await smppProvider.disconnect();
                return {
                    success: result.success,
                    externalId: result.externalId,
                    error: null
                };
            } catch (error) {
                return {
                    success: false,
                    externalId: null,
                    error: error.message
                };
            }
        }

        if (provider.type === 'ss7') {
            const SS7Provider = require('./providers/ss7');
            const ss7Provider = new SS7Provider(provider.config);
            try {
                await ss7Provider.connect();
                const result = await ss7Provider.sendMessage(message.recipient, message.content, message.id);
                await ss7Provider.disconnect();
                return {
                    success: result.success,
                    externalId: result.externalId,
                    error: null
                };
            } catch (error) {
                return {
                    success: false,
                    externalId: null,
                    error: error.message
                };
            }
        }

        if (provider.type === 'generic-http') {
            const GenericHttpProvider = require('./providers/generic-http');
            const httpProvider = new GenericHttpProvider(provider.config);
            return await httpProvider.send(message);
        }

        // Fallback for mock/demo
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // For demonstration, we'll simulate a 90% success rate
        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
            return {
                success: true,
                externalId: `mock_${Math.random().toString(36).substring(7)}`,
                error: null
            };
        } else {
            return {
                success: false,
                externalId: null,
                error: 'Simulated mock provider failure'
            };
        }
    }
}

module.exports = new ProviderService();
