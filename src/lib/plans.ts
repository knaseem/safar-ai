export type PlanTier = 'free' | 'pro' | 'vip'

export interface PlanLimits {
    maxTrips: number
    maxPdfExports: number
    chatRequestsPerMin: number
    maxChatRefinements: number
    hasPrioritySupport: boolean
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
    free: {
        maxTrips: 5,
        maxPdfExports: 1,
        chatRequestsPerMin: 10,
        maxChatRefinements: 3,
        hasPrioritySupport: false,
    },
    pro: {
        maxTrips: Infinity,
        maxPdfExports: Infinity,
        chatRequestsPerMin: 100,
        maxChatRefinements: Infinity,
        hasPrioritySupport: true,
    },
    vip: {
        maxTrips: Infinity,
        maxPdfExports: Infinity,
        chatRequestsPerMin: 100,
        maxChatRefinements: Infinity,
        hasPrioritySupport: true,
    }
}

export const DEFAULT_PLAN: PlanTier = 'free'

