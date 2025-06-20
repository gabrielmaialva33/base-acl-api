import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import type { NextFn } from '@adonisjs/core/types/http'

import ForbiddenException from '#exceptions/forbidden_exception'
import OptimizedPermissionService from '#modules/permission/services/optimized/optimized_permission_service'
import AuditService from '#modules/audit/services/audit_service'

interface PermissionOptions {
  permissions: string | string[]
  requireAll?: boolean
  context?: string
  resourceIdParam?: string
}

export default class PermissionMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: PermissionOptions) {
    const { auth, i18n, params } = ctx

    // Ensure user is authenticated
    const user = auth.getUserOrFail()

    const permissionService = await app.container.make(OptimizedPermissionService)
    const auditService = await app.container.make(AuditService)

    // Get resource ID if specified
    let resourceId: number | undefined
    if (options.resourceIdParam) {
      resourceId = Number.parseInt(params[options.resourceIdParam])
    }

    const hasPermission = await permissionService.checkUserPermission({
      user_id: user.id,
      permission: options.permissions,
      requireAll: options.requireAll || false,
      context: options.context,
      resource_id: resourceId,
    })

    // Extract resource and action for audit logging
    const permissions = Array.isArray(options.permissions)
      ? options.permissions
      : [options.permissions]
    const firstPermission = permissions[0].split('.')
    const resource = firstPermission[0]
    const action = firstPermission[1]

    if (!hasPermission) {
      // Log failed permission check
      await auditService.logPermissionCheck(
        {
          userId: user.id,
          resource,
          action,
          context: options.context,
          resourceId,
          result: 'denied',
          reason: 'Insufficient permissions',
        },
        ctx
      )

      throw new ForbiddenException(
        i18n.t('errors.insufficient_permissions', {
          permissions: Array.isArray(options.permissions)
            ? options.permissions.join(', ')
            : options.permissions,
        })
      )
    }

    // Log successful permission check
    await auditService.logPermissionCheck(
      {
        userId: user.id,
        resource,
        action,
        context: options.context,
        resourceId,
        result: 'granted',
        reason: 'Permission granted',
      },
      ctx
    )

    return next()
  }
}
