import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

import ListRolesService from '#modules/role/services/list-roles/list_roles_service'
import SyncRolesService from '#modules/role/services/attach-roles/sync_roles_service'

import { attachRoleValidator } from '#modules/role/validation/roles_validator'

@inject()
export default class RolesController {
  async list({ response }: HttpContext) {
    const service = await app.container.make(ListRolesService)

    const roles = await service.run()
    return response.json(roles)
  }

  async attach({ request, response, i18n }: HttpContext) {
    const data = request.body()

    const { user_id: userId, role_ids: roleIds } = await attachRoleValidator.validate(data)

    const syncRolesService = await app.container.make(SyncRolesService)
    await syncRolesService.run({ userId, roleIds })

    return response.json({
      message: i18n.t('messages.successfully_attached', {
        resource: i18n.t('models.role'),
      }),
    })
  }
}
