
export type Plan = {
    id: string;
    name: string;
    audience: 'Client' | 'Provider' | 'Auditor';
    price: {
        USD: string;
        EUR: string;
        INR: string;
    };
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
};

export const subscriptionPlans: Plan[] = [
    // Client Plans
    {
        id: 'client-free',
        name: 'Client Access',
        audience: 'Client',
        price: { USD: 'Free', EUR: 'Free', INR: 'Free' },
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
    },
    {
        id: 'client-plus',
        name: 'Client Plus',
        audience: 'Client',
        price: { USD: '$99 / month', EUR: '€89 / month', INR: '₹7,999 / month' },
        description: "For multi‑vendor operations.",
        userLimit: 20,
        dataLimitGB: 50,
        assetLimit: 'Unlimited',
        biddingLimit: 0,
        equipmentLimit: 0,
        marketplaceAccess: true,
        reportingLevel: 'Advanced',
        apiAccess: false,
        customBranding: false,
        isPublic: true,
        isActive: true,
    },
    // Provider Plans
    {
        id: 'provider-starter',
        name: 'Provider Starter',
        audience: 'Provider',
        price: { USD: 'Free', EUR: 'Free', INR: 'Free' },
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
    },
    {
        id: 'provider-pro',
        name: 'Provider Pro',
        audience: 'Provider',
        price: { USD: '$49 / company / month', EUR: '€45 / company / month', INR: '₹4,000 / company / month' },
        description: "For professional teams and growing companies.",
        userLimit: 5,
        dataLimitGB: 25,
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
    },
    {
        id: 'provider-growth',
        name: 'Company Growth',
        audience: 'Provider',
        price: { USD: '$120 / company / month', EUR: '€110 / company / month', INR: '₹10,000 / company / month' },
        description: "Per company",
        userLimit: 15,
        dataLimitGB: 75,
        assetLimit: 0,
        biddingLimit: 'Unlimited',
        equipmentLimit: 'Unlimited',
        marketplaceAccess: true,
        reportingLevel: 'Advanced',
        apiAccess: true,
        customBranding: true,
        isPublic: true,
        isActive: true,
    },
    // Auditor Plan
    {
        id: 'auditor-free',
        name: 'Free Access',
        audience: 'Auditor',
        price: { USD: 'Free', EUR: 'Free', INR: 'Free' },
        description: "For Level-III professionals and auditors.",
        userLimit: 1,
        dataLimitGB: 1,
        assetLimit: 0,
        biddingLimit: 0,
        equipmentLimit: 0,
        marketplaceAccess: false,
        reportingLevel: 'Basic',
        apiAccess: false,
        customBranding: false,
        isPublic: true,
        isActive: true,
    }
];

// This is now derived from the main array and includes all properties.
export const subscriptionPlanDetails = subscriptionPlans.reduce((acc, plan) => {
    acc[plan.name] = plan;
    return acc;
}, {} as Record<string, Plan>);
