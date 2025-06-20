import LucidRepository from '#shared/lucid/lucid_repository'
import Permission from '#modules/permission/models/permission'
import IPermission from '#modules/permission/interfaces/permission_interface'

export default class PermissionRepository
  extends LucidRepository<typeof Permission>
  implements IPermission.Repository
{
  constructor() {
    super(Permission)
  }

  async findByName(name: string): Promise<Permission | null> {
    return await Permission.findBy('name', name)
  }

  async findByResourceAction(resource: string, action: string): Promise<Permission | null> {
    return await Permission.query().where('resource', resource).where('action', action).first()
  }

  async syncPermissions(permissions: IPermission.SyncPermissionData[]): Promise<void> {
    for (const permissionData of permissions) {
      await Permission.firstOrCreate(
        {
          resource: permissionData.resource,
          action: permissionData.action,
        },
        {
          name: permissionData.name,
          description: permissionData.description,
        }
      )
    }
  }
}
