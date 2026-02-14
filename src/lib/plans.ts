export type PlanTier = 'free' | 'pro'

export interface PlanLimits {
    maxTrips: number
    maxPdfExports: number
    chatRequestsPerMin: number
    hasPrioritySupport: boolean
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
    free: {
        maxTrips: 5,
        maxPdfExports: 1,
        chatRequestsPerMin: 10,
        hasPrioritySupport: false,
    },
    pro: {
        maxTrips: Infinity,
        maxPdfExports: Infinity,
        chatRequestsPerMin: 100,
        hasPrioritySupport: true,
    }
}

export const DEFAULT_PLAN: PlanTier = 'free'
