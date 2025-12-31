const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class BrandingService {
    /**
     * Resolves the organization and its branding based on the request hostname.
     */
    async getBrandingByHost(hostname) {
        // Find organization matching the custom domain
        const org = await prisma.organization.findUnique({
            where: { customDomain: hostname }
        });

        if (!org) {
            return this.getDefaultBranding();
        }

        return {
            organizationId: org.id,
            companyName: org.companyName || org.name,
            logoUrl: org.logoUrl || '/assets/logo-default.svg',
            primaryColor: org.primaryColor || '#8b5cf6'
        };
    }

    async updateBranding(orgId, data) {
        return await prisma.organization.update({
            where: { id: orgId },
            data: {
                customDomain: data.customDomain,
                logoUrl: data.logoUrl,
                primaryColor: data.primaryColor,
                companyName: data.companyName
            }
        });
    }

    getDefaultBranding() {
        return {
            organizationId: null,
            companyName: 'MsgSync Platform',
            logoUrl: '/assets/logo-default.svg',
            primaryColor: '#8b5cf6'
        };
    }
}

module.exports = new BrandingService();
