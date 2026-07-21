const Queue = require('bull');
const dotenv = require('dotenv');

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create the message delivery queue
const messageQueue = new Queue('message-delivery', redisUrl);

// Process the queue
// In a real application, this might be in a separate worker process
if (process.env.NODE_ENV !== 'test') {
    const { processMessage } = require('../services/messageProcessor');

    // We'll define the processor function separately
    messageQueue.process(async (job) => {
        const { messageId } = job.data;
        console.log(`Processing message: ${messageId}`);
        return await processMessage(messageId);
    });

    messageQueue.on('completed', (job, result) => {
        console.log(`Job completed for message ${job.data.messageId}`);
    });

    messageQueue.on('failed', (job, err) => {
        console.error(`Job failed for message ${job.data.messageId}:`, err.message);
    });
}

module.exports = messageQueue;
