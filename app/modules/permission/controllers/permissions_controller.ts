import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

import ListPermissionsService from '#modules/permission/services/list-permissions/list_permissions_service'
import CreatePermissionService from '#modules/permission/services/create-permission/create_permission_service'
import SyncRolePermissionsService from '#modules/permission/services/sync-permissions/sync_role_permissions_service'
import SyncUserPermissionsService from '#modules/permission/services/sync-permissions/sync_user_permissions_service'
import CheckUserPermissionService from '#modules/permission/services/check-permission/check_user_permission_service'

import {
  createPermissionValidator,
  syncRolePermissionsValidator,
  syncUserPermissionsValidator,
} from '#modules/permission/validators/permission_validators'

export default class PermissionsController {
  /**
   * List all permissions with pagination
   */
  async list({ request }: HttpContext) {
    const { page = 1, perPage = 10, resource, action } = request.qs()

    const service = await app.container.make(ListPermissionsService)
    return await service.handle(page, perPage, resource, action)
  }

  /**
   * Create a new permission
   */
  async create({ request, response }: HttpContext) {
    const data = await request.validateUsing(createPermissionValidator)

    const service = await app.container.make(CreatePermissionService)
    const permission = await service.handle(data)

    return response.status(201).json(permission)
  }

  /**
   * Sync permissions for a role
   */
  async syncRolePermissions({ request, response }: HttpContext) {
    const { role_id: roleId, permission_ids: permissionIds } = await request.validateUsing(
      syncRolePermissionsValidator
    )

    const service = await app.container.make(SyncRolePermissionsService)
    await service.handle(roleId, permissionIds)

    return response.json({ message: 'Permissions synced successfully' })
  }

  /**
   * Attach permissions to a role (without removing existing ones)
   */
  async attachRolePermissions({ request, response }: HttpContext) {
    const { role_id: roleId, permission_ids: permissionIds } = await request.validateUsing(
      syncRolePermissionsValidator
    )

    const service = await app.container.make(SyncRolePermissionsService)
    await service.attachPermissions(roleId, permissionIds)

    return response.json({ message: 'Permissions attached successfully' })
  }

  /**
   * Detach permissions from a role
   */
  async detachRolePermissions({ request, response }: HttpContext) {
    const { role_id: roleId, permission_ids: permissionIds } = await request.validateUsing(
      syncRolePermissionsValidator
    )

    const service = await app.container.make(SyncRolePermissionsService)
    await service.detachPermissions(roleId, permissionIds)

    return response.json({ message: 'Permissions detached successfully' })
  }

  /**
   * Sync permissions for a user
   */
  async syncUserPermissions({ request, response }: HttpContext) {
    const data = await request.validateUsing(syncUserPermissionsValidator)

    const service = await app.container.make(SyncUserPermissionsService)
    await service.handle(data.user_id, data.permissions)

    return response.json({ message: 'User permissions synced successfully' })
  }

  /**
   * Get user permissions
   */
  async getUserPermissions({ params }: HttpContext) {
    const userId = params.id

    const service = await app.container.make(CheckUserPermissionService)
    const permissions = await service.getUserPermissions(userId)

    return { permissions }
  }

  /**
   * Check if user has specific permissions
   */
  async checkUserPermissions({ request, params }: HttpContext) {
    const userId = params.id
    const { permissions, require_all: requireAll = false } = request.only([
      'permissions',
      'require_all',
    ])

    const service = await app.container.make(CheckUserPermissionService)
    const hasPermission = await service.handle(userId, permissions, requireAll)

    return { has_permission: hasPermission }
  }
}
