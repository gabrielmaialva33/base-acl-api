import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import type { NextFn } from '@adonisjs/core/types/http'

import IRole from '#modules/role/interfaces/role_interface'
import ForbiddenException from '#exceptions/forbidden_exception'
import GetUserService from '#modules/user/services/get-user/get_user_service'

export default class AclMiddleware {
  async handle(
    { loggedUserId, i18n }: HttpContext,
    next: NextFn,
    opts: { role_slugs: IRole.Slugs[] }
  ) {
    const service = await app.container.make(GetUserService)
    const user = await service.run(loggedUserId)

    if (user) {
      await user.load('roles')
      const hasNecessaryRole = user.roles.some((role: { slug: IRole.Slugs }) =>
        opts.role_slugs.includes(role.slug)
      )
      if (hasNecessaryRole) return next()
    }

    throw new ForbiddenException(i18n.t('errors.permission_denied'))
  }
}
