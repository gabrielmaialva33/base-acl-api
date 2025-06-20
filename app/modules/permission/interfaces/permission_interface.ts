import LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'
import Permission from '#modules/permission/models/permission'

namespace IPermission {
  export interface Repository extends LucidRepositoryInterface<typeof Permission> {
    findByName(name: string): Promise<Permission | null>
    findByResourceAction(resource: string, action: string): Promise<Permission | null>
    syncPermissions(
      permissions: Array<{ name: string; resource: string; action: string; description?: string }>
    ): Promise<void>
  }

  export interface PermissionCheck {
    user_id: number
    permission: string | string[]
    requireAll?: boolean
  }

  export enum Resources {
    USERS = 'users',
    ROLES = 'roles',
    PERMISSIONS = 'permissions',
    FILES = 'files',
    SETTINGS = 'settings',
    REPORTS = 'reports',
    AUDIT = 'audit',
  }

  export enum Actions {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    EXPORT = 'export',
    IMPORT = 'import',
    ASSIGN = 'assign',
    REVOKE = 'revoke',
  }

  export interface PermissionData {
    name: string
    description?: string
    resource: string
    action: string
  }
}

export default IPermission
