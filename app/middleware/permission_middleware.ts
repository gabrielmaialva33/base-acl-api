import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import type { NextFn } from '@adonisjs/core/types/http'

import ForbiddenException from '#exceptions/forbidden_exception'
import CheckUserPermissionService from '#modules/permission/services/check-permission/check_user_permission_service'

interface PermissionOptions {
  permissions: string | string[]
  requireAll?: boolean
}

export default class PermissionMiddleware {
  async handle({ auth, i18n }: HttpContext, next: NextFn, options: PermissionOptions) {
    // Ensure user is authenticated
    const user = auth.getUserOrFail()

    const service = await app.container.make(CheckUserPermissionService)

    const hasPermission = await service.handle(
      user.id,
      options.permissions,
      options.requireAll || false
    )

    if (!hasPermission) {
      throw new ForbiddenException(
        i18n.t('errors.insufficient_permissions', {
          permissions: Array.isArray(options.permissions)
            ? options.permissions.join(', ')
            : options.permissions,
        })
      )
    }

    return next()
  }
}
