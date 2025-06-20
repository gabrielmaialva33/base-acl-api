import { inject } from '@adonisjs/core'
import PermissionRepository from '#modules/permission/repositories/permission_repository'
import IPermission from '#modules/permission/interfaces/permission_interface'

@inject()
export default class CreateDefaultPermissionsService {
  constructor(private permissionRepository: PermissionRepository) {}

  async run(): Promise<void> {
    const defaultPermissions = this.getDefaultPermissions()
    await this.permissionRepository.syncPermissions(defaultPermissions)
  }

  private getDefaultPermissions(): IPermission.SyncPermissionData[] {
    const permissions: IPermission.SyncPermissionData[] = []

    // Default permissions for each resource
    const resourceActions: Record<string, string[]> = {
      [IPermission.Resources.USERS]: [
        IPermission.Actions.CREATE,
        IPermission.Actions.READ,
        IPermission.Actions.UPDATE,
        IPermission.Actions.DELETE,
        IPermission.Actions.LIST,
        IPermission.Actions.EXPORT,
      ],
      [IPermission.Resources.ROLES]: [
        IPermission.Actions.CREATE,
        IPermission.Actions.READ,
        IPermission.Actions.UPDATE,
        IPermission.Actions.DELETE,
        IPermission.Actions.LIST,
        IPermission.Actions.ASSIGN,
        IPermission.Actions.REVOKE,
      ],
      [IPermission.Resources.PERMISSIONS]: [
        IPermission.Actions.CREATE,
        IPermission.Actions.READ,
        IPermission.Actions.UPDATE,
        IPermission.Actions.DELETE,
        IPermission.Actions.LIST,
        IPermission.Actions.ASSIGN,
        IPermission.Actions.REVOKE,
      ],
      [IPermission.Resources.FILES]: [
        IPermission.Actions.CREATE,
        IPermission.Actions.READ,
        IPermission.Actions.DELETE,
        IPermission.Actions.LIST,
      ],
      [IPermission.Resources.SETTINGS]: [IPermission.Actions.READ, IPermission.Actions.UPDATE],
      [IPermission.Resources.REPORTS]: [
        IPermission.Actions.READ,
        IPermission.Actions.CREATE,
        IPermission.Actions.EXPORT,
      ],
      [IPermission.Resources.AUDIT]: [
        IPermission.Actions.READ,
        IPermission.Actions.LIST,
        IPermission.Actions.EXPORT,
      ],
    }

    // Generate permissions based on resource and action combinations
    Object.entries(resourceActions).forEach(([resource, actions]) => {
      actions.forEach((action) => {
        permissions.push({
          name: `${resource}.${action}`,
          resource,
          action,
          description: `${this.capitalize(action)} ${resource}`,
        })
      })
    })

    return permissions
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}
