const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

exports.ssoLogin = async (req, res) => {
    try {
        const { provider } = req.params;
        const { code } = req.query;

        if (!code) {
            // In reality, redirect to Google/GitHub OAuth URL
            const mockRedirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=ABC&redirect_uri=http://localhost:3000/api/auth/sso/${provider}/callback&response_type=code`;
            return res.redirect(mockRedirectUrl);
        }

        // 1. Mock exchanging code for user info
        const mockUserInfo = {
            id: `sso_${provider}_12345`,
            email: 'admin@msgsync.com',
            name: 'Demo Admin',
            avatar: 'https://ui-avatars.com/api/?name=Demo+Admin'
        };

        // 2. Find or create user
        let user = await prisma.user.findUnique({
            where: { email: mockUserInfo.email },
            include: { organization: true }
        });

        if (!user) {
            // Find a default organization or create one
            let org = await prisma.organization.findFirst({ where: { type: 'ADMIN' } });
            if (!org) {
                org = await prisma.organization.create({
                    data: { name: 'Default Admin Org', type: 'ADMIN' }
                });
            }

            user = await prisma.user.create({
                data: {
                    email: mockUserInfo.email,
                    name: mockUserInfo.name,
                    ssoId: mockUserInfo.id,
                    ssoProvider: provider,
                    avatarUrl: mockUserInfo.avatar,
                    organizationId: org.id
                },
                include: { organization: true }
            });
        }

        // 3. Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, orgId: user.organizationId },
            process.env.JWT_SECRET || 'secret-key',
            { expiresIn: '24h' }
        );

        // 4. Redirect to dashboard with token (simplified for demo)
        res.redirect(`/dashboard?token=${token}`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ error: 'No token' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { organization: true }
        });

        res.json(user);
    } catch (error) {
        res.status(401).json({ error: 'Invalid session' });
    }
};
