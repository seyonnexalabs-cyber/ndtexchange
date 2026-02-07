
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
    features: string[];
    userLimit: number;
    dataLimitGB: number;
    limitations: {
        assets?: string;
        bids?: string;
        equipment?: string;
        jobs?: string;
    };
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
        features: [
            "Post unlimited jobs to marketplace",
            "Asset register (up to 200 assets)",
            "Read‑only access to NDT reports",
            "Vendor‑shared reports",
            "Asset register with inspection history and maintenance visibility",
            "Web portal access",
        ],
        userLimit: 5,
        dataLimitGB: 2,
        limitations: {
            assets: 'Up to 200',
            jobs: 'Unlimited',
        },
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
        features: [
            "Everything in Client Access, plus:",
            "Unlimited assets",
            "Multiple vendors",
            "Comments & approvals",
            "Shutdown inspection view",
            "Asset register with cross‑vendor inspection history and maintenance visibility",
        ],
        userLimit: 20,
        dataLimitGB: 50,
        limitations: {
            assets: 'Unlimited',
            jobs: 'Unlimited',
        },
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
        features: [
            "Access to job marketplace",
            "Submit up to 3 bids per month",
            "Digital report creation",
            "Manage 1 technician",
            "Equipment tracking (up to 2 items)",
        ],
        userLimit: 1,
        dataLimitGB: 1,
        limitations: {
            bids: 'Up to 3/month',
            equipment: 'Up to 2',
        },
        isPublic: true,
        isActive: true,
    },
    {
        id: 'provider-pro',
        name: 'Provider Pro',
        audience: 'Provider',
        price: { USD: '$49 / company / month', EUR: '€45 / company / month', INR: '₹4,000 / company / month' },
        description: "For professional teams and growing companies.",
        features: [
            "Includes 5 inspectors",
            "Unlimited marketplace bidding",
            "Client-linked projects",
            "Team & equipment management",
            "Level-III review workflows",
            "Advanced reporting tools",
        ],
        userLimit: 5,
        dataLimitGB: 25,
        limitations: {
            bids: 'Unlimited',
            equipment: 'Unlimited',
        },
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
        features: [
            "Includes 15 inspectors",
            "Unlimited marketplace bidding",
            "Multi-site operations & analytics",
            "Custom branding on reports",
            "Priority support",
            "Advanced equipment tracking",
        ],
        userLimit: 15,
        dataLimitGB: 75,
        limitations: {
            bids: 'Unlimited',
            equipment: 'Unlimited',
        },
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
        features: [
            "Access to all assigned audit jobs",
            "Review & approval workflows",
            "Audit comments & traceability",
            "Certification reference access",
            "Cross-project oversight (limited)",
        ],
        userLimit: 1,
        dataLimitGB: 1,
        limitations: {
            jobs: 'Assigned Only',
        },
        isPublic: true,
        isActive: true,
    }
];

export const subscriptionPlanDetails = subscriptionPlans.reduce((acc, plan) => {
    acc[plan.name] = { userLimit: plan.userLimit, dataLimitGB: plan.dataLimitGB };
    return acc;
}, {} as Record<string, {userLimit: number, dataLimitGB: number}>);
