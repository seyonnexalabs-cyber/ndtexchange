
export type Plan = {
    id: string;
    name: string;
    audience: 'Client' | 'Provider' | 'Auditor';
    price: {
        monthly: { USD: string; EUR: string; INR: string; };
        yearly: { USD: string; EUR: string; INR: string; };
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
            monthly: { USD: 'Free', EUR: 'Free', INR: 'Free' },
            yearly: { USD: 'Free', EUR: 'Free', INR: 'Free' },
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
            monthly: { USD: '$99', EUR: '€89', INR: '₹7,999' },
            yearly: { USD: '$990', EUR: '€890', INR: '₹79,990' },
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
            monthly: { USD: 'Free', EUR: 'Free', INR: 'Free' },
            yearly: { USD: 'Free', EUR: 'Free', INR: 'Free' },
        },
        description: "For individual inspectors getting started.",
        userLimit: 1,
        dataLimitGB: 1,
        assetLimit: 0,
        biddingLimit: 3,
        equipmentLimit: 2,
        marketplaceAccess: true,
        reportingLevel: 'Basic',
        apiAccess: false,
        customBranding: false,
        isPublic: true,
        isActive: true,
        features: [
            'Access to job marketplace',
            'Submit up to 3 bids per month',
            'Manage up to 2 equipment items',
            'Digital reporting tools'
        ],
    },
    {
        id: 'provider-pro',
        name: 'Provider Pro',
        audience: 'Provider',
        price: {
            monthly: { USD: '$49', EUR: '€45', INR: '₹4,000' },
            yearly: { USD: '$490', EUR: '€450', INR: '₹40,000' },
        },
        priceDescription: '/ company / month',
        description: "For professional teams and growing companies.",
        userLimit: 50,
        dataLimitGB: 100,
        assetLimit: 0,
        biddingLimit: 'Unlimited',
        equipmentLimit: 'Unlimited',
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
            "Unlimited bids on marketplace jobs",
            "Manage unlimited equipment items",
            "Team management up to 50 users",
        ],
    },
    {
        id: 'provider-growth',
        name: 'Company Growth',
        audience: 'Provider',
        price: {
            monthly: { USD: '$120', EUR: '€110', INR: '₹10,000' },
            yearly: { USD: '$1200', EUR: '€1100', INR: '₹100,000' },
        },
        priceDescription: '/ company / month',
        description: "Per company",
        userLimit: 150,
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
            "Custom branding on reports",
            "Advanced API access for integrations",
            "Team management up to 150 users",
        ],
    },
    // Auditor Plan
    {
        id: 'auditor-free',
        name: 'Free Access',
        audience: 'Auditor',
        price: {
            monthly: { USD: 'Free', EUR: 'Free', INR: 'Free' },
            yearly: { USD: 'Free', EUR: 'Free', INR: 'Free' },
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
