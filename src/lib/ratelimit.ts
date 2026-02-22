import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create a new ratelimiter using Upstash Redis
// Vercel's Upstash integration creates KV_REST_API_* env vars
const redis = new Redis({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

import { PLAN_LIMITS, DEFAULT_PLAN } from './plans'

// Rate limiters for different endpoints
export const chatRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(PLAN_LIMITS[DEFAULT_PLAN].chatRequestsPerMin, '60 s'),
    analytics: true,
    prefix: 'ratelimit:chat',
})

export const contactRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 requests per minute for contact form
    analytics: true,
    prefix: 'ratelimit:contact',
})

export const generalRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '60 s'), // 30 requests per minute for general API
    analytics: true,
    prefix: 'ratelimit:general',
})

/**
 * Check if rate limiting is enabled (env vars are set)
 */
export function isRateLimitEnabled(): boolean {
    return !!(
        (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
        (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    )
}

/**
 * Helper to get rate limit identifier (IP address)
 */
export function getRateLimitIdentifier(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    return '127.0.0.1'
}

/**
 * Helper to apply per-user tiered rate limits
 */
export async function limitByUserTier(userId: string, prefix: string) {
    if (!isRateLimitEnabled()) return { success: true, remaining: 0, reset: 0 }

    // Dynamically import to avoid circular deps on cold start
    const { getUserPlan } = await import('./user-plan')
    const plan = await getUserPlan(userId)
    const limit = PLAN_LIMITS[plan].chatRequestsPerMin

    // Create a per-tier rate limiter
    const tierLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, '60 s'),
        analytics: true,
        prefix: `ratelimit:${prefix}:${plan}`,
    })

    return tierLimiter.limit(`${prefix}:${userId}`)
}
