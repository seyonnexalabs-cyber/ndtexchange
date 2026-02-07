export type PlanDetails = {
    userLimit: number;
    dataLimitGB: number;
};

export const subscriptionPlans: Record<string, PlanDetails> = {
    'Free Trial': {
        userLimit: 5,
        dataLimitGB: 5,
    },
    'Client': {
        userLimit: 10,
        dataLimitGB: 20,
    },
    'Provider': {
        userLimit: 50,
        dataLimitGB: 100,
    },
    'Enterprise': {
        userLimit: 200,
        dataLimitGB: 500,
    },
};
