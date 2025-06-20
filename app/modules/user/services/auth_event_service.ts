import emitter from '@adonisjs/core/services/emitter'
import type { HttpContext } from '@adonisjs/core/http'

import {
  extractRequestMetadata,
  type LoginAttemptedEventData,
  type LoginFailedEventData,
  type LoginSucceededEventData,
  type LogoutEventData,
  type TokenRefreshedEventData,
  type UserRegisteredEventData,
} from '#modules/user/events/auth_events'
import type User from '#modules/user/models/user'
import { DateTime } from 'luxon'

export default class AuthEventService {
  /**
   * Emit login attempted event
   */
  static emitLoginAttempted(email: string, ctx: HttpContext) {
    const eventData: LoginAttemptedEventData = {
      email,
      timestamp: DateTime.now().toJSDate(),
      ...extractRequestMetadata(ctx),
    }

    emitter.emit('auth:login_attempted', eventData)
  }

  /**
   * Emit login succeeded event
   */
  static emitLoginSucceeded(
    user: User,
    method: 'password' | 'oauth' | 'token',
    isAdmin: boolean,
    ctx: HttpContext,
    additionalData?: { sessionId?: string; rememberMeToken?: string }
  ) {
    const eventData: LoginSucceededEventData = {
      user,
      method,
      isAdmin,
      timestamp: new Date(),
      ...extractRequestMetadata(ctx),
      ...additionalData,
    }

    emitter.emit('auth:login_succeeded', eventData)
  }

  /**
   * Emit login failed event
   */
  static emitLoginFailed(email: string, reason: string, ctx: HttpContext, attemptCount?: number) {
    const eventData: LoginFailedEventData = {
      email,
      reason,
      attemptCount,
      timestamp: new Date(),
      ...extractRequestMetadata(ctx),
    }

    emitter.emit('auth:login_failed', eventData)
  }

  /**
   * Emit logout event
   */
  static emitLogout(user: User | null, ctx: HttpContext, sessionId?: string) {
    const eventData: LogoutEventData = {
      user,
      timestamp: new Date(),
      sessionId,
      ...extractRequestMetadata(ctx),
    }

    emitter.emit('auth:logout', eventData)
  }

  /**
   * Emit user registered event
   */
  static emitUserRegistered(
    user: User,
    source: 'sign-up' | 'oauth' | 'admin-created',
    emailVerified: boolean,
    ctx: HttpContext
  ) {
    const eventData: UserRegisteredEventData = {
      user,
      method: 'password',
      source,
      emailVerified,
      timestamp: new Date(),
      ...extractRequestMetadata(ctx),
    }

    emitter.emit('auth:user_registered', eventData)
  }

  /**
   * Emit token refreshed event
   */
  static emitTokenRefreshed(
    user: User,
    ctx: HttpContext,
    tokenIds?: { oldTokenId?: string; newTokenId?: string }
  ) {
    const eventData: TokenRefreshedEventData = {
      user,
      timestamp: new Date(),
      ...extractRequestMetadata(ctx),
      ...tokenIds,
    }

    emitter.emit('auth:token_refreshed', eventData)
  }
}
