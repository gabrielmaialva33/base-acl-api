import { BaseSchema } from '@adonisjs/lucid/schema'
import app from '@adonisjs/core/services/app'

import CreateDefaultPermissionsService from '#modules/permission/services/create-permission/create_default_permissions_service'
import SyncRolePermissionsService from '#modules/permission/services/sync-permissions/sync_role_permissions_service'
import Role from '#modules/role/models/role'
import Permission from '#modules/permission/models/permission'
import IRole from '#modules/role/interfaces/role_interface'
import IPermission from '#modules/permission/interfaces/permission_interface'

export default class extends BaseSchema {
  async up() {
    // Create default permissions
    const createPermissionsService = await app.container.make(CreateDefaultPermissionsService)
    await createPermissionsService.run()

    // Assign permissions to roles
    const syncRolePermissionsService = await app.container.make(SyncRolePermissionsService)

    // ROOT - All permissions
    const rootRole = await Role.findBy('slug', IRole.Slugs.ROOT)
    if (rootRole) {
      const allPermissions = await Permission.all()
      await syncRolePermissionsService.handle(
        rootRole.id,
        allPermissions.map((p) => p.id)
      )
    }

    // ADMIN - All permissions except managing permissions
    const adminRole = await Role.findBy('slug', IRole.Slugs.ADMIN)
    if (adminRole) {
      const adminPermissions = await Permission.query()
        .whereNot('resource', IPermission.Resources.PERMISSIONS)
        .orWhere((query) => {
          query
            .where('resource', IPermission.Resources.PERMISSIONS)
            .whereIn('action', [IPermission.Actions.READ, IPermission.Actions.LIST])
        })

      await syncRolePermissionsService.handle(
        adminRole.id,
        adminPermissions.map((p) => p.id)
      )
    }

    // USER - Basic permissions
    const userRole = await Role.findBy('slug', IRole.Slugs.USER)
    if (userRole) {
      const userPermissions = await Permission.query()
        .where((query) => {
          query
            .where('resource', IPermission.Resources.USERS)
            .whereIn('action', [IPermission.Actions.READ, IPermission.Actions.UPDATE])
        })
        .orWhere((query) => {
          query
            .where('resource', IPermission.Resources.FILES)
            .whereIn('action', [
              IPermission.Actions.CREATE,
              IPermission.Actions.READ,
              IPermission.Actions.LIST,
            ])
        })

      await syncRolePermissionsService.handle(
        userRole.id,
        userPermissions.map((p) => p.id)
      )
    }

    // GUEST - Read only
    const guestRole = await Role.findBy('slug', IRole.Slugs.GUEST)
    if (guestRole) {
      const guestPermissions = await Permission.query()
        .whereIn('action', [IPermission.Actions.READ, IPermission.Actions.LIST])
        .whereNotIn('resource', [IPermission.Resources.PERMISSIONS, IPermission.Resources.AUDIT])

      await syncRolePermissionsService.handle(
        guestRole.id,
        guestPermissions.map((p) => p.id)
      )
    }
  }

  async down() {
    // Remove all permission associations
    await app.container.use('db').raw('TRUNCATE TABLE role_permissions CASCADE')
    await app.container.use('db').raw('TRUNCATE TABLE user_permissions CASCADE')
    await app.container.use('db').raw('TRUNCATE TABLE permissions CASCADE')
  }
}
