import LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'
import Permission from '#modules/permission/models/permission'

namespace IPermission {
  export interface Repository extends LucidRepositoryInterface<typeof Permission> {
    findByName(name: string): Promise<Permission | null>

    findByResourceAction(resource: string, action: string): Promise<Permission | null>

    syncPermissions(permissions: SyncPermissionData[]): Promise<void>
  }

  export interface SyncPermissionData {
    name: string
    resource: string
    action: string
    description?: string
  }

  export interface PermissionCheck {
    user_id: number
    permission: string | string[]
    requireAll?: boolean
    context?: string
    resource_id?: number
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

  export enum Contexts {
    OWN = 'own',
    ANY = 'any',
    TEAM = 'team',
    DEPARTMENT = 'department',
  }

  export interface PermissionData {
    name?: string
    description?: string
    resource: string
    action: string
    context?: string
  }

  export interface ContextPermissionCheck {
    userId: number
    resource: string
    action: string
    context: string
    resourceId?: number
    ownerId?: number
  }
}

export default IPermission
