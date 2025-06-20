import { inject } from '@adonisjs/core'
import Role from '#modules/role/models/role'
import Permission from '#modules/permission/models/permission'
import IRole from '#modules/role/interfaces/role_interface'
import IPermission from '#modules/permission/interfaces/permission_interface'
import CreateDefaultPermissionsService from '#modules/permission/services/create-permission/create_default_permissions_service'
import SyncRolePermissionsService from '#modules/permission/services/sync-permissions/sync_role_permissions_service'

@inject()
export default class AssignDefaultPermissionsService {
  constructor(
    private createDefaultPermissionsService: CreateDefaultPermissionsService,
    private syncRolePermissionsService: SyncRolePermissionsService
  ) {}

  async run(): Promise<void> {
    // First, create all default permissions
    await this.createDefaultPermissionsService.run()

    // Then assign permissions to roles
    await this.assignPermissionsToRoles()
  }

  private async assignPermissionsToRoles(): Promise<void> {
    // ROOT - All permissions
    await this.assignRootPermissions()

    // ADMIN - All except permission management
    await this.assignAdminPermissions()

    // USER - Basic permissions
    await this.assignUserPermissions()

    // GUEST - Read only
    await this.assignGuestPermissions()
  }

  private async assignRootPermissions(): Promise<void> {
    const rootRole = await Role.findBy('slug', IRole.Slugs.ROOT)
    if (rootRole) {
      const allPermissions = await Permission.all()
      await this.syncRolePermissionsService.handle(
        rootRole.id,
        allPermissions.map((p) => p.id)
      )
    }
  }

  private async assignAdminPermissions(): Promise<void> {
    const adminRole = await Role.findBy('slug', IRole.Slugs.ADMIN)
    if (adminRole) {
      const adminPermissions = await Permission.query()
        .whereNot('resource', IPermission.Resources.PERMISSIONS)
        .orWhere((query) => {
          query
            .where('resource', IPermission.Resources.PERMISSIONS)
            .whereIn('action', [IPermission.Actions.READ, IPermission.Actions.LIST])
        })

      await this.syncRolePermissionsService.handle(
        adminRole.id,
        adminPermissions.map((p) => p.id)
      )
    }
  }

  private async assignUserPermissions(): Promise<void> {
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

      await this.syncRolePermissionsService.handle(
        userRole.id,
        userPermissions.map((p) => p.id)
      )
    }
  }

  private async assignGuestPermissions(): Promise<void> {
    const guestRole = await Role.findBy('slug', IRole.Slugs.GUEST)
    if (guestRole) {
      const guestPermissions = await Permission.query()
        .whereIn('action', [IPermission.Actions.READ, IPermission.Actions.LIST])
        .whereNotIn('resource', [IPermission.Resources.PERMISSIONS, IPermission.Resources.AUDIT])

      await this.syncRolePermissionsService.handle(
        guestRole.id,
        guestPermissions.map((p) => p.id)
      )
    }
  }
}
