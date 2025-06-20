import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import User from '#modules/user/models/user'

@inject()
export default class CheckUserPermissionService {
  async handle(
    userId: number,
    permissionNames: string | string[],
    requireAll: boolean = false
  ): Promise<boolean> {
    const user = await User.query()
      .where('id', userId)
      .preload('roles', (query) => {
        query.preload('permissions')
      })
      .preload('permissions')
      .firstOrFail()

    const permissionsToCheck = Array.isArray(permissionNames) ? permissionNames : [permissionNames]

    // Collect all user permissions
    const userPermissions = new Set<string>()

    // Direct user permissions
    user.permissions.forEach((permission) => {
      const pivot = permission.$extras.pivot_granted
      const expiresAt = permission.$extras.pivot_expires_at

      // Check if permission is active
      if (pivot && (!expiresAt || DateTime.fromISO(expiresAt) > DateTime.now())) {
        userPermissions.add(permission.name)
      }
    })

    // Role permissions
    user.roles.forEach((role) => {
      role.permissions.forEach((permission) => {
        userPermissions.add(permission.name)
      })
    })

    // Check permissions
    if (requireAll) {
      // All permissions must be present
      return permissionsToCheck.every((permission) => userPermissions.has(permission))
    } else {
      // At least one permission must be present
      return permissionsToCheck.some((permission) => userPermissions.has(permission))
    }
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await User.query()
      .where('id', userId)
      .preload('roles', (query) => {
        query.preload('permissions')
      })
      .preload('permissions')
      .firstOrFail()

    const userPermissions = new Set<string>()

    // Direct user permissions
    user.permissions.forEach((permission) => {
      const pivot = permission.$extras.pivot_granted
      const expiresAt = permission.$extras.pivot_expires_at

      if (pivot && (!expiresAt || DateTime.fromISO(expiresAt) > DateTime.now())) {
        userPermissions.add(permission.name)
      }
    })

    // Role permissions
    user.roles.forEach((role) => {
      role.permissions.forEach((permission) => {
        userPermissions.add(permission.name)
      })
    })

    return Array.from(userPermissions)
  }
}
