const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create a demo API Key
    const demoKey = await prisma.apiKey.upsert({
        where: { key: 'demo-api-key' },
        update: {},
        create: {
            key: 'demo-api-key',
            name: 'Demo App'
        }
    });
    console.log(`Created/Ensured API Key: ${demoKey.key}`);

    // 2. Create a Mock Provider
    await prisma.provider.upsert({
        where: { name: 'mock-provider' },
        update: {},
        create: {
            name: 'mock-provider',
            type: 'generic-http',
            config: {
                url: 'https://api.mock-provider.com/v1/sms',
                method: 'POST',
                payloadTemplate: {
                    to: '{{recipient}}',
                    text: '{{content}}'
                }
            },
            priority: 1
        }
    });
    console.log('Created/Ensured Mock Provider');

    console.log('Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
