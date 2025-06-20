import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import Role from '#modules/role/models/role'
import NotFoundException from '#exceptions/not_found_exception'

@inject()
export default class SyncRolePermissionsService {
  async handle(roleId: number, permissionIds: number[]): Promise<void> {
    try {
      const { i18n } = HttpContext.getOrFail()
      const role = await Role.find(roleId)
      if (!role) {
        throw new NotFoundException(
          i18n.t('errors.not_found', {
            resource: i18n.t('models.role'),
          })
        )
      }

      // Sync permissions (this removes old permissions and adds new ones)
      await role.related('permissions').sync(permissionIds)
    } catch (error) {
      // If HttpContext is not available (e.g., in migrations), fallback logic
      const role = await Role.find(roleId)
      if (!role) {
        throw new NotFoundException('Role not found')
      }
      await role.related('permissions').sync(permissionIds)
    }
  }

  async attachPermissions(roleId: number, permissionIds: number[]): Promise<void> {
    try {
      const { i18n } = HttpContext.getOrFail()
      const role = await Role.find(roleId)
      if (!role) {
        throw new NotFoundException(
          i18n.t('errors.not_found', {
            resource: i18n.t('models.role'),
          })
        )
      }

      // Attach only adds new permissions without removing existing ones
      await role.related('permissions').attach(permissionIds)
    } catch (error) {
      // If HttpContext is not available (e.g., in migrations), fallback logic
      const role = await Role.find(roleId)
      if (!role) {
        throw new NotFoundException('Role not found')
      }
      await role.related('permissions').attach(permissionIds)
    }
  }

  async detachPermissions(roleId: number, permissionIds: number[]): Promise<void> {
    try {
      const { i18n } = HttpContext.getOrFail()
      const role = await Role.find(roleId)
      if (!role) {
        throw new NotFoundException(
          i18n.t('errors.not_found', {
            resource: i18n.t('models.role'),
          })
        )
      }

      // Detach removes only the specified permissions
      await role.related('permissions').detach(permissionIds)
    } catch (error) {
      // If HttpContext is not available (e.g., in migrations), fallback logic
      const role = await Role.find(roleId)
      if (!role) {
        throw new NotFoundException('Role not found')
      }
      await role.related('permissions').detach(permissionIds)
    }
  }
}
