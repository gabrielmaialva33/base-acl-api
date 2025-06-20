import type User from '#modules/user/models/user'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Authentication event types
 */
export interface AuthenticationEventData {
  user: User
  timestamp: Date
  ip?: string
  userAgent?: string
  requestId?: string
  method: 'password' | 'oauth' | 'token'
}

export interface LoginAttemptedEventData {
  email: string
  timestamp: Date
  ip?: string
  userAgent?: string
  requestId?: string
}

export interface LoginSucceededEventData extends AuthenticationEventData {
  sessionId?: string
  rememberMeToken?: string
  isAdmin: boolean
}

export interface LoginFailedEventData extends LoginAttemptedEventData {
  reason: string
  attemptCount?: number
}

export interface LogoutEventData {
  user: User | null
  timestamp: Date
  ip?: string
  requestId?: string
  sessionId?: string
}

export interface UserRegisteredEventData extends AuthenticationEventData {
  emailVerified: boolean
  source: 'sign-up' | 'oauth' | 'admin-created'
}

export interface TokenRefreshedEventData {
  user: User
  timestamp: Date
  oldTokenId?: string
  newTokenId?: string
  ip?: string
  requestId?: string
}

/**
 * Event names
 */
export const AuthEvents = {
  LOGIN_ATTEMPTED: 'auth:login_attempted',
  LOGIN_SUCCEEDED: 'auth:login_succeeded',
  LOGIN_FAILED: 'auth:login_failed',
  LOGOUT: 'auth:logout',
  USER_REGISTERED: 'auth:user_registered',
  TOKEN_REFRESHED: 'auth:token_refreshed',
} as const

/**
 * Helper to extract request metadata from HttpContext
 */
export function extractRequestMetadata(ctx: HttpContext) {
  return {
    ip: ctx.request.ip(),
    userAgent: ctx.request.header('user-agent'),
    requestId: ctx.request.id(),
  }
}
