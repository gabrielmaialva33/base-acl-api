import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'

import ListRolesService from '#modules/role/services/list-roles/list_roles_service'
import SyncRolesService from '#modules/role/services/attach-roles/sync_roles_service'

import { attachRoleValidator } from '#modules/role/validation/roles_validator'

@inject()
export default class RolesController {
  async list({ request, response }: HttpContext) {
    const service = await app.container.make(ListRolesService)
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 10)

    const roles = await service.run({ page, perPage })
    return response.json(roles)
  }

  async attach({ request, response }: HttpContext) {
    try {
      const { user_id: userId, role_ids: roleIds } = await attachRoleValidator.validate(
        request.all()
      )

      // Check if user exists
      const user = await db.from('users').where('id', userId).first()
      if (!user) {
        return response.notFound({ message: 'User not found' })
      }

      // Check if all roles exist
      const roles = await db.from('roles').whereIn('id', roleIds)
      if (roles.length !== roleIds.length) {
        return response.notFound({ message: 'Role not found' })
      }

      // Check for existing role attachments
      const existingRoles = await db
        .from('user_roles')
        .where('user_id', userId)
        .whereIn('role_id', roleIds)

      if (existingRoles.length > 0) {
        return response.conflict({ message: 'User already has this role' })
      }

      const syncRolesService = await app.container.make(SyncRolesService)
      await syncRolesService.run({ userId, roleIds })

      return response.json({
        message: 'Role attached successfully',
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ errors: error.messages })
      }
      throw error
    }
  }
}
