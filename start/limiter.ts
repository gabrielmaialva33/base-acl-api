import limiter from '@adonisjs/limiter/services/main'

/**
 * Global throttle for general API endpoints
 * - 60 requests per minute for authenticated users
 * - 20 requests per minute for guest users
 */
export const throttle = limiter.define('global', async (ctx) => {
  /**
   * More lenient rate limit for authenticated users
   */
  try {
    await ctx.auth.check()
    if (ctx.auth.user) {
      return limiter.allowRequests(60).every('1 minute').usingKey(`user_${ctx.auth.user.id}`)
    }
  } catch {
    // User is not authenticated
  }

  /**
   * Stricter rate limit for guest users
   */
  return limiter.allowRequests(20).every('1 minute').usingKey(`ip_${ctx.request.ip()}`)
})

/**
 * Strict throttle for authentication endpoints
 * - 5 attempts per 15 minutes by IP + email combination
 * - Blocks for 30 minutes after exhausting attempts
 */
export const authThrottle = limiter.define('auth', (ctx) => {
  const uid = ctx.request.input('uid') || ctx.request.input('email') || 'unknown'

  return limiter
    .allowRequests(5)
    .every('15 minutes')
    .blockFor('30 minutes')
    .usingKey(`auth_${ctx.request.ip()}_${uid}`)
    .limitExceeded((error) => {
      error.setMessage('Too many authentication attempts. Please try again later.')
    })
})

/**
 * API throttle for protected API endpoints
 * - 100 requests per minute for authenticated users
 * - 10 requests per minute for guest users
 */
export const apiThrottle = limiter.define('api', async (ctx) => {
  /**
   * Higher rate limit for authenticated API users
   */
  try {
    await ctx.auth.check()
    if (ctx.auth.user) {
      return limiter.allowRequests(100).every('1 minute').usingKey(`api_user_${ctx.auth.user.id}`)
    }
  } catch {
    // User is not authenticated
  }

  /**
   * Lower rate limit for unauthenticated API requests
   */
  return limiter.allowRequests(10).every('1 minute').usingKey(`api_ip_${ctx.request.ip()}`)
})

/**
 * Upload throttle for file upload endpoints
 * - 10 uploads per hour for authenticated users
 * - Blocks for 1 hour after exhausting attempts
 */
export const uploadThrottle = limiter.define('upload', (ctx) => {
  if (!ctx.auth.user) {
    throw new Error('Authentication required for uploads')
  }

  return limiter
    .allowRequests(10)
    .every('1 hour')
    .blockFor('1 hour')
    .usingKey(`upload_user_${ctx.auth.user.id}`)
    .limitExceeded((error) => {
      error.setMessage('Upload limit exceeded. Please try again in an hour.')
    })
})

/**
 * Admin throttle for administrative endpoints
 * - 200 requests per minute
 * - Only for authenticated admin/root users
 */
export const adminThrottle = limiter.define('admin', (ctx) => {
  if (!ctx.auth.user) {
    throw new Error('Authentication required')
  }

  return limiter.allowRequests(200).every('1 minute').usingKey(`admin_user_${ctx.auth.user.id}`)
})
