import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create a new ratelimiter using Upstash Redis
// Vercel's Upstash integration creates KV_REST_API_* env vars
const redis = new Redis({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Rate limiters for different endpoints
export const chatRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 requests per minute
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
 * Get identifier for rate limiting (IP or user ID)
 */
export function getRateLimitIdentifier(request: Request, userId?: string): string {
    if (userId) return `user:${userId}`

    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'anonymous'
    return `ip:${ip}`
}
