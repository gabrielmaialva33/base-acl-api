import { inject } from '@adonisjs/core'
import redis from '@adonisjs/redis/services/main'
import Permission from '#modules/permission/models/permission'
import User from '#modules/user/models/user'
import Role from '#modules/role/models/role'

@inject()
export default class PermissionCacheService {
  private readonly CACHE_PREFIX = 'acl:permissions'
  private readonly DEFAULT_TTL = 3600 // 1 hour in seconds
  private readonly ROLE_TTL = 7200 // 2 hours in seconds

  /**
   * Cache user permissions
   */
  async cacheUserPermissions(userId: number, permissions: Permission[]): Promise<void> {
    const key = this.USER_PERMISSIONS_KEY(userId)
    const permissionData = permissions.map((p) => ({
      id: p.id,
      name: p.name,
      resource: p.resource,
      action: p.action,
      context: p.context || 'any',
    }))

    await redis.setex(key, this.DEFAULT_TTL, JSON.stringify(permissionData))
  }

  /**
   * Get cached user permissions
   */
  async getCachedUserPermissions(userId: number): Promise<Permission[] | null> {
    const key = this.USER_PERMISSIONS_KEY(userId)
    const cached = await redis.get(key)

    if (!cached) {
      return null
    }

    try {
      const permissionData = JSON.parse(cached)
      return permissionData.map((p: any) => {
        const permission = new Permission()
        permission.id = p.id
        permission.name = p.name
        permission.resource = p.resource
        permission.action = p.action
        permission.context = p.context
        return permission
      })
    } catch (error) {
      await redis.del(key)
      return null
    }
  }

  /**
   * Cache user roles
   */
  async cacheUserRoles(userId: number, roles: Role[]): Promise<void> {
    const key = this.USER_ROLES_KEY(userId)
    const roleData = roles.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
    }))

    await redis.setex(key, this.ROLE_TTL, JSON.stringify(roleData))
  }

  /**
   * Get cached user roles
   */
  async getCachedUserRoles(userId: number): Promise<Role[] | null> {
    const key = this.USER_ROLES_KEY(userId)
    const cached = await redis.get(key)

    if (!cached) {
      return null
    }

    try {
      const roleData = JSON.parse(cached)
      return roleData.map((r: any) => {
        const role = new Role()
        role.id = r.id
        role.name = r.name
        role.slug = r.slug
        return role
      })
    } catch (error) {
      await redis.del(key)
      return null
    }
  }

  /**
   * Cache role permissions
   */
  async cacheRolePermissions(roleId: number, permissions: Permission[]): Promise<void> {
    const key = this.ROLE_PERMISSIONS_KEY(roleId)
    const permissionData = permissions.map((p) => ({
      id: p.id,
      name: p.name,
      resource: p.resource,
      action: p.action,
      context: p.context || 'any',
    }))

    await redis.setex(key, this.ROLE_TTL, JSON.stringify(permissionData))
  }

  /**
   * Get cached role permissions
   */
  async getCachedRolePermissions(roleId: number): Promise<Permission[] | null> {
    const key = this.ROLE_PERMISSIONS_KEY(roleId)
    const cached = await redis.get(key)

    if (!cached) {
      return null
    }

    try {
      const permissionData = JSON.parse(cached)
      return permissionData.map((p: any) => {
        const permission = new Permission()
        permission.id = p.id
        permission.name = p.name
        permission.resource = p.resource
        permission.action = p.action
        permission.context = p.context
        return permission
      })
    } catch (error) {
      await redis.del(key)
      return null
    }
  }

  /**
   * Cache permission existence check
   */
  async cachePermissionExists(
    resource: string,
    action: string,
    context: string = 'any',
    exists: boolean
  ): Promise<void> {
    const key = this.PERMISSION_KEY(resource, action, context)
    await redis.setex(key, this.DEFAULT_TTL, exists ? '1' : '0')
  }

  /**
   * Get cached permission existence
   */
  async getCachedPermissionExists(
    resource: string,
    action: string,
    context: string = 'any'
  ): Promise<boolean | null> {
    const key = this.PERMISSION_KEY(resource, action, context)
    const cached = await redis.get(key)

    if (cached === null) {
      return null
    }

    return cached === '1'
  }

  /**
   * Invalidate user cache
   */
  async invalidateUserCache(userId: number): Promise<void> {
    const keys = [this.USER_PERMISSIONS_KEY(userId), this.USER_ROLES_KEY(userId)]

    await redis.del(...keys)
  }

  /**
   * Invalidate role cache
   */
  async invalidateRoleCache(roleId: number): Promise<void> {
    const key = this.ROLE_PERMISSIONS_KEY(roleId)
    await redis.del(key)
  }

  /**
   * Invalidate all user caches (when permissions change globally)
   */
  async invalidateAllUserCaches(): Promise<void> {
    const pattern = `${this.CACHE_PREFIX}:user:*`
    const keys = await redis.keys(pattern)

    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }

  /**
   * Invalidate all role caches
   */
  async invalidateAllRoleCaches(): Promise<void> {
    const pattern = `${this.CACHE_PREFIX}:role:*`
    const keys = await redis.keys(pattern)

    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }

  /**
   * Invalidate permission cache
   */
  async invalidatePermissionCache(
    resource: string,
    action: string,
    context: string = 'any'
  ): Promise<void> {
    const key = this.PERMISSION_KEY(resource, action, context)
    await redis.del(key)
  }

  /**
   * Warm up cache for a user
   */
  async warmUpUserCache(userId: number): Promise<void> {
    const user = await User.query()
      .where('id', userId)
      .preload('roles', (query) => {
        query.preload('permissions')
      })
      .preload('permissions')
      .first()

    if (!user) {
      return
    }

    // Cache user roles
    await this.cacheUserRoles(userId, user.roles)

    // Cache user permissions (direct + from roles)
    const allPermissions = [...user.permissions]
    user.roles.forEach((role) => {
      role.permissions.forEach((permission) => {
        if (!allPermissions.find((p) => p.id === permission.id)) {
          allPermissions.push(permission)
        }
      })
    })

    await this.cacheUserPermissions(userId, allPermissions)
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalKeys: number
    userPermissions: number
    userRoles: number
    rolePermissions: number
    permissionChecks: number
  }> {
    const allKeys = await redis.keys(`${this.CACHE_PREFIX}:*`)

    const userPermissions = allKeys.filter(
      (key) => key.includes(':user:') && !key.includes(':user_roles:')
    ).length
    const userRoles = allKeys.filter((key) => key.includes(':user_roles:')).length
    const rolePermissions = allKeys.filter((key) => key.includes(':role:')).length
    const permissionChecks = allKeys.filter((key) => key.includes(':permission:')).length

    return {
      totalKeys: allKeys.length,
      userPermissions,
      userRoles,
      rolePermissions,
      permissionChecks,
    }
  }

  /**
   * Clear all ACL cache
   */
  async clearAllCache(): Promise<void> {
    const pattern = `${this.CACHE_PREFIX}:*`
    const keys = await redis.keys(pattern)

    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }

  private readonly USER_PERMISSIONS_KEY = (userId: number) => `${this.CACHE_PREFIX}:user:${userId}`

  private readonly ROLE_PERMISSIONS_KEY = (roleId: number) => `${this.CACHE_PREFIX}:role:${roleId}`

  private readonly USER_ROLES_KEY = (userId: number) => `${this.CACHE_PREFIX}:user_roles:${userId}`

  private readonly PERMISSION_KEY = (resource: string, action: string, context: string = 'any') =>
    `${this.CACHE_PREFIX}:permission:${resource}:${action}:${context}`
}
