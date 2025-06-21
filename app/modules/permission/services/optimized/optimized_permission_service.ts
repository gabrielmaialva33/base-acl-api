import { inject } from '@adonisjs/core'
import User from '#modules/user/models/user'
import Permission from '#modules/permission/models/permission'
import IPermission from '#modules/permission/interfaces/permission_interface'
import PermissionCacheService from '#modules/permission/services/cache/permission_cache_service'
import PermissionInheritanceService from '#modules/permission/services/inheritance/permission_inheritance_service'

@inject()
export default class OptimizedPermissionService {
  constructor(
    private cacheService: PermissionCacheService,
    private inheritanceService: PermissionInheritanceService
  ) {}

  /**
   * Check user permission with caching and inheritance
   */
  async checkUserPermission(data: IPermission.PermissionCheck): Promise<boolean> {
    const {
      user_id: userId,
      permission,
      requireAll = false,
      context,
      resource_id: resourceId,
    } = data

    // Handle single permission
    if (typeof permission === 'string') {
      return await this.checkSinglePermission(userId, permission, context, resourceId)
    }

    // Handle multiple permissions
    const results = await Promise.all(
      permission.map((p) => this.checkSinglePermission(userId, p, context, resourceId))
    )

    return requireAll ? results.every(Boolean) : results.some(Boolean)
  }

  /**
   * Batch check permissions for multiple users
   */
  async batchCheckPermissions(
    checks: Array<{
      userId: number
      permission: string
      context?: string
      resourceId?: number
    }>
  ): Promise<Array<{ userId: number; permission: string; granted: boolean }>> {
    const results = await Promise.all(
      checks.map(async (check) => {
        const granted = await this.checkSinglePermission(
          check.userId,
          check.permission,
          check.context,
          check.resourceId
        )

        return {
          userId: check.userId,
          permission: check.permission,
          granted,
        }
      })
    )

    return results
  }

  /**
   * Pre-warm cache for multiple users
   */
  async preWarmCache(userIds: number[]): Promise<void> {
    await Promise.all(userIds.map((userId) => this.cacheService.warmUpUserCache(userId)))
  }

  /**
   * Get user permission summary
   */
  async getUserPermissionSummary(userId: number): Promise<{
    directPermissions: Permission[]
    rolePermissions: Permission[]
    effectivePermissions: Permission[]
    roles: string[]
  }> {
    const user = await User.query()
      .where('id', userId)
      .preload('permissions')
      .preload('roles', (query) => {
        query.preload('permissions')
      })
      .first()

    if (!user) {
      return {
        directPermissions: [],
        rolePermissions: [],
        effectivePermissions: [],
        roles: [],
      }
    }

    const directPermissions = user.permissions
    const rolePermissions = new Map<number, Permission>()
    const roles = user.roles.map((role) => role.slug)

    // Collect all role permissions with inheritance
    for (const role of user.roles) {
      const effectiveRolePermissions = await this.inheritanceService.getEffectivePermissions(
        role.slug
      )
      effectiveRolePermissions.forEach((permission) => {
        rolePermissions.set(permission.id, permission)
      })
    }

    const rolePermissionsList = Array.from(rolePermissions.values())

    // Combine all permissions
    const effectivePermissions = new Map<number, Permission>()
    directPermissions.forEach((p) => effectivePermissions.set(p.id, p))
    rolePermissionsList.forEach((p) => effectivePermissions.set(p.id, p))

    return {
      directPermissions,
      rolePermissions: rolePermissionsList,
      effectivePermissions: Array.from(effectivePermissions.values()),
      roles,
    }
  }

  /**
   * Check single permission for user
   */
  private async checkSinglePermission(
    userId: number,
    permission: string,
    context?: string,
    resourceId?: number
  ): Promise<boolean> {
    // Parse permission string (resource.action.context)
    const parts = permission.split('.')
    const resource = parts[0]
    const action = parts[1]
    const permissionContext = parts[2] || context || 'any'

    // Try cache first
    const cachedPermissions = await this.cacheService.getCachedUserPermissions(userId)

    if (cachedPermissions) {
      const hasPermission = this.checkPermissionInList(
        cachedPermissions,
        resource,
        action,
        permissionContext
      )

      if (hasPermission) {
        return await this.checkContextualPermission(
          userId,
          resource,
          action,
          permissionContext,
          resourceId
        )
      }
    }

    // Load from database with optimized query
    const userPermissions = await this.loadUserPermissionsOptimized(userId)

    // Cache the results
    await this.cacheService.cacheUserPermissions(userId, userPermissions)

    const hasPermission = this.checkPermissionInList(
      userPermissions,
      resource,
      action,
      permissionContext
    )

    if (hasPermission) {
      return await this.checkContextualPermission(
        userId,
        resource,
        action,
        permissionContext,
        resourceId
      )
    }

    return false
  }

  /**
   * Load user permissions with optimized queries
   */
  private async loadUserPermissionsOptimized(userId: number): Promise<Permission[]> {
    const user = await User.query()
      .where('id', userId)
      .preload('permissions', (query) => {
        query.where('granted', true)
        query.where((subQuery) => {
          subQuery.whereNull('expires_at').orWhere('expires_at', '>', new Date())
        })
      })
      .preload('roles', (query) => {
        query.preload('permissions')
      })
      .first()

    if (!user) {
      return []
    }

    const allPermissions = new Map<number, Permission>()

    // Add direct user permissions
    user.permissions.forEach((permission) => {
      allPermissions.set(permission.id, permission)
    })

    // Add permissions from roles with inheritance
    for (const role of user.roles) {
      const effectivePermissions = await this.inheritanceService.getEffectivePermissions(role.slug)
      effectivePermissions.forEach((permission) => {
        allPermissions.set(permission.id, permission)
      })
    }

    return Array.from(allPermissions.values())
  }

  /**
   * Check if permission exists in list
   */
  private checkPermissionInList(
    permissions: Permission[],
    resource: string,
    action: string,
    context: string
  ): boolean {
    return permissions.some((permission) => {
      return (
        permission.resource === resource &&
        permission.action === action &&
        (permission.context === context || permission.context === 'any')
      )
    })
  }

  /**
   * Check contextual permission (ownership, etc.)
   */
  private async checkContextualPermission(
    userId: number,
    resource: string,
    _action: string,
    context: string,
    resourceId?: number
  ): Promise<boolean> {
    // If context is 'any', permission is granted
    if (context === 'any') {
      return true
    }

    // If context is 'own', check ownership
    if (context === 'own' && resourceId) {
      return await this.checkResourceOwnership(userId, resource, resourceId)
    }

    // Add more contextual checks as needed
    return true
  }

  /**
   * Check resource ownership
   */
  private async checkResourceOwnership(
    userId: number,
    resource: string,
    resourceId: number
  ): Promise<boolean> {
    // This is a simplified implementation
    // You would implement specific ownership checks based on your domain

    switch (resource) {
      case 'users':
        return userId === resourceId

      case 'posts':
        // Example: check if user owns the post
        // const post = await Post.find(resourceId)
        // return post?.user_id === userId
        break

      case 'files':
        // Example: check if user uploaded the file
        // const file = await File.find(resourceId)
        // return file?.uploaded_by === userId
        break
    }

    return false
  }
}
