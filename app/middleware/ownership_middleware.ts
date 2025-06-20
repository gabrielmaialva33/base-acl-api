import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { inject } from '@adonisjs/core'
import OwnershipService from '#modules/ownership/services/ownership_service'
import AuditService from '#modules/audit/services/audit_service'

export interface OwnershipMiddlewareOptions {
  resource: string
  resourceIdParam?: string
  action?: string
  context?: string
  allowedLevels?: string[]
}

@inject()
export default class OwnershipMiddleware {
  constructor(
    private ownershipService: OwnershipService,
    private auditService: AuditService
  ) {}

  async handle(ctx: HttpContext, next: NextFn, options: OwnershipMiddlewareOptions) {
    const { auth, params, response } = ctx
    const {
      resource,
      resourceIdParam = 'id',
      action = 'access',
      context = 'own',
      allowedLevels = ['owner'],
    } = options

    // Check if user is authenticated
    const user = auth.user
    if (!user) {
      await this.auditService.logPermissionCheck(
        {
          resource,
          action,
          context,
          result: 'denied',
          reason: 'User not authenticated',
        },
        ctx
      )

      return response.unauthorized({
        message: 'Authentication required',
      })
    }

    // Get resource ID from params
    const resourceId = Number.parseInt(params[resourceIdParam])
    if (!resourceId || Number.isNaN(resourceId)) {
      await this.auditService.logPermissionCheck(
        {
          userId: user.id,
          resource,
          action,
          context,
          result: 'denied',
          reason: 'Invalid resource ID',
        },
        ctx
      )

      return response.badRequest({
        message: 'Invalid resource ID',
      })
    }

    try {
      // Check ownership
      const ownershipLevel = await this.ownershipService.getOwnershipLevel(
        user.id,
        resource,
        resourceId
      )

      if (!ownershipLevel || !allowedLevels.includes(ownershipLevel)) {
        await this.auditService.logPermissionCheck(
          {
            userId: user.id,
            resource,
            action,
            context,
            resourceId,
            result: 'denied',
            reason: `Insufficient ownership level: ${ownershipLevel || 'none'}`,
          },
          ctx
        )

        return response.forbidden({
          message: 'Insufficient permissions to access this resource',
        })
      }

      // Log successful access
      await this.auditService.logPermissionCheck(
        {
          userId: user.id,
          resource,
          action,
          context,
          resourceId,
          result: 'granted',
          reason: `Ownership level: ${ownershipLevel}`,
        },
        ctx
      )

      // Add ownership info to context for use in controllers
      ;(ctx as any).ownershipLevel = ownershipLevel
      ;(ctx as any).resourceId = resourceId

      await next()
    } catch (error) {
      await this.auditService.logPermissionCheck(
        {
          userId: user.id,
          resource,
          action,
          context,
          resourceId,
          result: 'denied',
          reason: `Error checking ownership: ${error.message}`,
        },
        ctx
      )

      return response.internalServerError({
        message: 'Error checking resource permissions',
      })
    }
  }
}

/**
 * Helper function to create ownership middleware instances
 */
export function ownership(options: OwnershipMiddlewareOptions) {
  return async (ctx: HttpContext, next: NextFn) => {
    const middleware = await ctx.containerResolver.make(OwnershipMiddleware)
    return middleware.handle(ctx, next, options)
  }
}
