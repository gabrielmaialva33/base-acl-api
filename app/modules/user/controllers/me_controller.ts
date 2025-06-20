import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

import GetUserPermissionsService from '#modules/user/services/get-user-permissions/get_user_permissions_service'
import GetUserRolesService from '#modules/user/services/get-user-roles/get_user_roles_service'
import GetUserService from '#modules/user/services/get-user/get_user_service'

@inject()
export default class MeController {
  /**
   * Get current user profile
   */
  async profile({ auth, response }: HttpContext) {
    const user = auth.user!
    const service = await app.container.make(GetUserService)

    const userWithRoles = await service.run(user.id)
    return response.json(userWithRoles)
  }

  /**
   * Get current user permissions
   */
  async permissions({ auth, response }: HttpContext) {
    const user = auth.user!
    const service = await app.container.make(GetUserPermissionsService)

    const permissions = await service.run(user.id)
    return response.json(permissions)
  }

  /**
   * Get current user roles
   */
  async roles({ auth, response }: HttpContext) {
    const user = auth.user!
    const service = await app.container.make(GetUserRolesService)

    const roles = await service.run(user.id)
    return response.json(roles)
  }
}
