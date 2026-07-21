const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware to authenticate requests using an API key.
 * Supports both X-API-Key header and Authorization: Bearer <key>
 */
async function authenticate(req, res, next) {
    let apiKeyStr = req.headers['x-api-key'];

    const authHeader = req.headers['authorization'];
    if (!apiKeyStr && authHeader && authHeader.startsWith('Bearer ')) {
        apiKeyStr = authHeader.split(' ')[1];
    }

    if (!apiKeyStr) {
        return res.status(401).json({
            status: 'error',
            message: 'Authentication required. Please provide an API key.'
        });
    }

    try {
        const apiKey = await prisma.apiKey.findUnique({
            where: { key: apiKeyStr },
            include: { organization: true }
        });

        if (!apiKey || !apiKey.active) {
            return res.status(403).json({
                status: 'error',
                message: 'Invalid or inactive API key.'
            });
        }

        // Attach context to request
        req.apiKey = apiKey;
        req.organization = apiKey.organization;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res
            .status(500)
            .json({
                status: 'error',
                message: 'Internal server error during authentication.'
            });
    }
}

module.exports = authenticate;
