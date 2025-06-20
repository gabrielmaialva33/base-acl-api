import { inject } from '@adonisjs/core'
import Role from '#modules/role/models/role'
import PermissionRepository from '#modules/permission/repositories/permission_repository'
import NotFoundException from '#exceptions/not_found_exception'

@inject()
export default class SyncRolePermissionsService {
  constructor(private permissionRepository: PermissionRepository) {}

  async handle(roleId: number, permissionIds: number[]): Promise<void> {
    const role = await Role.find(roleId)
    if (!role) {
      throw new NotFoundException('Role not found')
    }

    // Sync permissions (this removes old permissions and adds new ones)
    await role.related('permissions').sync(permissionIds)
  }

  async attachPermissions(roleId: number, permissionIds: number[]): Promise<void> {
    const role = await Role.find(roleId)
    if (!role) {
      throw new NotFoundException('Role not found')
    }

    // Attach only adds new permissions without removing existing ones
    await role.related('permissions').attach(permissionIds)
  }

  async detachPermissions(roleId: number, permissionIds: number[]): Promise<void> {
    const role = await Role.find(roleId)
    if (!role) {
      throw new NotFoundException('Role not found')
    }

    // Detach removes only the specified permissions
    await role.related('permissions').detach(permissionIds)
  }
}
