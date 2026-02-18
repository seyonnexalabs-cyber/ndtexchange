
export type Plan = {
    id: string;
    name: string;
    audience: 'Client' | 'Provider' | 'Auditor';
    price: {
        // Price in USD cents to avoid floating point issues
        monthlyUSD: number;
        yearlyUSD: number;
    };
    priceDescription?: string;
    description: string;
    userLimit: number;
    dataLimitGB: number;
    assetLimit: 'Unlimited' | number;
    biddingLimit: 'Unlimited' | number;
    equipmentLimit: 'Unlimited' | number;
    marketplaceAccess: boolean;
    reportingLevel: 'Basic' | 'Advanced';
    apiAccess: boolean;
    customBranding: boolean;
    isPublic: boolean;
    isActive: boolean;
    isFeatured?: boolean;
    isPopular?: boolean;
    features: string[];
};

export const subscriptionPlans: Plan[] = [
    // Client Plans
    {
        id: 'client-free',
        name: 'Client Access',
        audience: 'Client',
        price: {
            monthlyUSD: 0,
            yearlyUSD: 0,
        },
        description: "For plants, EPCs, and pilot teams.",
        userLimit: 5,
        dataLimitGB: 2,
        assetLimit: 200,
        biddingLimit: 0,
        equipmentLimit: 0,
        marketplaceAccess: true,
        reportingLevel: 'Basic',
        apiAccess: false,
        customBranding: false,
        isPublic: true,
        isActive: true,
        isFeatured: true,
        features: [
            'Post unlimited jobs to marketplace',
            'Manage up to 200 assets',
            '2GB Data Vault for all job reports & documents',
            'Standard historical reporting'
        ],
    },
    {
        id: 'client-plus',
        name: 'Client Plus',
        audience: 'Client',
        price: {
            monthlyUSD: 9900,
            yearlyUSD: 95000,
        },
        priceDescription: '/ month',
        description: "For multi‑vendor operations.",
        userLimit: 200,
        dataLimitGB: 500,
        assetLimit: 'Unlimited',
        biddingLimit: 0,
        equipmentLimit: 0,
        marketplaceAccess: true,
        reportingLevel: 'Advanced',
        apiAccess: false,
        customBranding: false,
        isPublic: true,
        isActive: true,
        features: [
            "All Client Access features",
            "Manage unlimited assets",
            "50GB Data Vault for all job reports & documents",
            "Advanced analytics & reporting",
        ],
    },
    // Provider Plans
    {
        id: 'provider-starter',
        name: 'Provider Starter',
        audience: 'Provider',
        price: {
            monthlyUSD: 0,
            yearlyUSD: 0,
        },
        description: "For individual inspectors getting started.",
        userLimit: 1,
        dataLimitGB: 1,
        assetLimit: 0,
        biddingLimit: 1,
        equipmentLimit: 2,
        marketplaceAccess: true,
        reportingLevel: 'Basic',
        apiAccess: false,
        customBranding: false,
        isPublic: true,
        isActive: true,
        features: [
            'Access to job marketplace',
            'Submit up to 1 bid per month',
            'Manage up to 2 equipment items',
            'Digital reporting tools'
        ],
    },
    {
        id: 'provider-pro',
        name: 'Provider Pro',
        audience: 'Provider',
        price: {
            monthlyUSD: 2900,
            yearlyUSD: 27800,
        },
        priceDescription: '/ company / month',
        description: "For professional teams and growing companies.",
        userLimit: 5,
        dataLimitGB: 100,
        assetLimit: 0,
        biddingLimit: 10,
        equipmentLimit: 25,
        marketplaceAccess: true,
        reportingLevel: 'Basic',
        apiAccess: false,
        customBranding: false,
        isPublic: true,
        isActive: true,
        isFeatured: true,
        isPopular: true,
        features: [
            "All Provider Starter features",
            "Submit up to 10 bids per month",
            "Manage up to 25 equipment items",
            "Team management up to 5 users",
        ],
    },
    {
        id: 'provider-growth',
        name: 'Company Growth',
        audience: 'Provider',
        price: {
            monthlyUSD: 9900,
            yearlyUSD: 95000,
        },
        priceDescription: '/ company / month',
        description: "Per company",
        userLimit: 50,
        dataLimitGB: 200,
        assetLimit: 0,
        biddingLimit: 'Unlimited',
        equipmentLimit: 'Unlimited',
        marketplaceAccess: true,
        reportingLevel: 'Advanced',
        apiAccess: true,
        customBranding: true,
        isPublic: true,
        isActive: true,
        features: [
            "All Provider Pro features",
            "Unlimited bids on marketplace jobs",
            "Manage unlimited equipment",
            "Custom branding on reports",
            "Advanced API access for integrations",
            "Team management up to 50 users",
        ],
    },
    // Auditor Plan
    {
        id: 'auditor-free',
        name: 'Free Access',
        audience: 'Auditor',
        price: {
            monthlyUSD: 0,
            yearlyUSD: 0,
        },
        description: "For Level-III professionals and auditors.",
        userLimit: 200,
        dataLimitGB: 500,
        assetLimit: 0,
        biddingLimit: 0,
        equipmentLimit: 0,
        marketplaceAccess: false,
        reportingLevel: 'Basic',
        apiAccess: false,
        customBranding: false,
        isPublic: true,
        isActive: true,
        features: [
            'Access to all assigned audit jobs',
            'Secure document review',
            'Direct communication with clients & providers',
        ],
    }
];

// This is now derived from the main array and includes all properties.
export const subscriptionPlanDetails = subscriptionPlans.reduce((acc, plan) => {
    acc[plan.name] = plan;
    return acc;
}, {} as Record<string, Plan>);
