import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import UsersRepository from '#modules/user/repositories/users_repository'
import NotFoundException from '#exceptions/not_found_exception'
import db from '@adonisjs/lucid/services/db'

@inject()
export default class GetUserPermissionsService {
  constructor(private usersRepository: UsersRepository) {}

  async run(userId: number) {
    const { i18n } = HttpContext.getOrFail()

    const user = await this.usersRepository.findBy('id', userId)
    if (!user) {
      throw new NotFoundException(
        i18n.t('errors.not_found', {
          resource: i18n.t('models.user'),
        })
      )
    }

    // Get direct user permissions
    const directPermissions = await db
      .from('user_permissions')
      .join('permissions', 'user_permissions.permission_id', 'permissions.id')
      .where('user_permissions.user_id', userId)
      .where('user_permissions.granted', true)
      .where(function (query) {
        query.whereNull('user_permissions.expires_at')
        query.orWhere('user_permissions.expires_at', '>', new Date())
      })
      .select(
        'permissions.id',
        'permissions.name',
        'permissions.resource',
        'permissions.action',
        'permissions.description',
        'user_permissions.expires_at',
        'user_permissions.granted'
      )
      .orderBy('permissions.resource')
      .orderBy('permissions.action')

    // Get permissions through roles
    const rolePermissions = await db
      .from('user_roles')
      .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('user_roles.user_id', userId)
      .select(
        'permissions.id',
        'permissions.name',
        'permissions.resource',
        'permissions.action',
        'permissions.description'
      )
      .orderBy('permissions.resource')
      .orderBy('permissions.action')

    // Combine permissions (remove duplicates)
    const permissionMap = new Map()

    // Add role permissions first
    rolePermissions.forEach((perm) => {
      permissionMap.set(perm.id, {
        id: perm.id,
        name: perm.name,
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
        source: 'role',
      })
    })

    // Add direct permissions (they override role permissions)
    directPermissions.forEach((perm) => {
      permissionMap.set(perm.id, {
        id: perm.id,
        name: perm.name,
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
        expires_at: perm.expires_at,
        granted: perm.granted,
        source: 'direct',
      })
    })

    // Group permissions by resource
    const groupedPermissions: Record<string, any[]> = {}

    Array.from(permissionMap.values()).forEach((permission) => {
      if (!groupedPermissions[permission.resource]) {
        groupedPermissions[permission.resource] = []
      }
      groupedPermissions[permission.resource].push(permission)
    })

    return {
      total: permissionMap.size,
      permissions: Array.from(permissionMap.values()),
      grouped: groupedPermissions,
    }
  }
}
