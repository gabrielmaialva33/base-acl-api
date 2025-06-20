import type { ApplicationService } from '@adonisjs/core/types'
import emitter from '@adonisjs/core/services/emitter'
import logger from '@adonisjs/core/services/logger'
import '../types/events.js'

export default class AuthEventsProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  async register() {}

  /**
   * Register authentication event listeners when the application is ready
   */
  async ready() {
    /**
     * Listen for login attempted events
     */
    emitter.on('auth:login_attempted', (data) => {
      logger.info({
        event: 'auth:login_attempted',
        email: data.email,
        ip: data.ip,
        userAgent: data.userAgent,
        requestId: data.requestId,
        timestamp: data.timestamp,
      })
    })

    /**
     * Listen for successful login events
     */
    emitter.on('auth:login_succeeded', (data) => {
      logger.info({
        event: 'auth:login_succeeded',
        userId: data.user.id,
        email: data.user.email,
        method: data.method,
        isAdmin: data.isAdmin,
        ip: data.ip,
        userAgent: data.userAgent,
        requestId: data.requestId,
        timestamp: data.timestamp,
      })
    })

    /**
     * Listen for failed login events
     */
    emitter.on('auth:login_failed', (data) => {
      logger.warn({
        event: 'auth:login_failed',
        email: data.email,
        reason: data.reason,
        attemptCount: data.attemptCount,
        ip: data.ip,
        userAgent: data.userAgent,
        requestId: data.requestId,
        timestamp: data.timestamp,
      })
    })

    /**
     * Listen for logout events
     */
    emitter.on('auth:logout', (data) => {
      logger.info({
        event: 'auth:logout',
        userId: data.user?.id,
        email: data.user?.email,
        ip: data.ip,
        requestId: data.requestId,
        timestamp: data.timestamp,
      })
    })

    /**
     * Listen for user registration events
     */
    emitter.on('auth:user_registered', (data) => {
      logger.info({
        event: 'auth:user_registered',
        userId: data.user.id,
        email: data.user.email,
        source: data.source,
        emailVerified: data.emailVerified,
        ip: data.ip,
        userAgent: data.userAgent,
        requestId: data.requestId,
        timestamp: data.timestamp,
      })
    })

    /**
     * Listen for token refresh events
     */
    emitter.on('auth:token_refreshed', (data) => {
      logger.info({
        event: 'auth:token_refreshed',
        userId: data.user.id,
        email: data.user.email,
        oldTokenId: data.oldTokenId,
        newTokenId: data.newTokenId,
        ip: data.ip,
        requestId: data.requestId,
        timestamp: data.timestamp,
      })
    })
  }

  /**
   * Cleanup bindings
   */
  async shutdown() {
    // Event listeners are automatically cleaned up by AdonisJS
  }
}
