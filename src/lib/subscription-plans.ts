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
            "Asset register (up to 200 assets)",
            "Read‑only access to NDT reports",
            "Vendor‑shared reports",
            "Asset register with inspection history and maintenance visibility",
            "Web portal access",
        ],
        userLimit: 5,
        dataLimitGB: 2,
        isPublic: true,
        isActive: true,
        isFeatured: true,
    },
    {
        id: 'client-plus',
        name: 'Client Plus',
        audience: 'Client',
        price: { USD: '$60 – $100 / month', EUR: '€55 – €90 / month', INR: '₹5,000 – ₹8,000 / month' },
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
        isPublic: true,
        isActive: true,
    },
    // Provider Plans
    {
        id: 'provider-individual',
        name: 'Individual Inspector',
        audience: 'Provider',
        price: { USD: '$20 / inspector / month', EUR: '€18 / inspector / month', INR: '₹1,500 / inspector / month' },
        description: "Per inspector",
        features: [
            "14-day free trial",
            "Submit up to 10 bids per month",
            "Digital report creation",
            "Equipment tracking (up to 5 items)",
        ],
        userLimit: 1,
        dataLimitGB: 5,
        isPublic: true,
        isActive: true,
    },
    {
        id: 'provider-company',
        name: 'NDT Company',
        audience: 'Provider',
        price: { USD: '$65 / company / month', EUR: '€60 / company / month', INR: '₹5,000 / company / month' },
        description: "Per company",
        features: [
            "14-day free trial",
            "Up to 5 inspectors",
            "Unlimited marketplace bidding",
            "Client-linked projects",
            "Level-III review workflows",
            "Equipment & calibration tracking (up to 20 items)",
        ],
        userLimit: 5,
        dataLimitGB: 25,
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
            "14-day free trial",
            "Up to 15 inspectors",
            "Unlimited marketplace bidding",
            "Multi-site operations & analytics",
            "Advanced report templates",
            "Priority support",
            "Advanced equipment tracking (up to 50 items)",
        ],
        userLimit: 15,
        dataLimitGB: 75,
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
            "Review & approval workflows",
            "Audit comments & traceability",
            "Certification reference access",
            "Cross-project oversight (limited)",
        ],
        userLimit: 1,
        dataLimitGB: 1,
        isPublic: true,
        isActive: true,
    }
];

export const subscriptionPlanDetails = subscriptionPlans.reduce((acc, plan) => {
    acc[plan.name] = { userLimit: plan.userLimit, dataLimitGB: plan.dataLimitGB };
    return acc;
}, {} as Record<string, {userLimit: number, dataLimitGB: number}>);
