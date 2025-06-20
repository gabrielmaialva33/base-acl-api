import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import User from '#modules/user/models/user'
import PermissionRepository from '#modules/permission/repositories/permission_repository'
import NotFoundException from '#exceptions/not_found_exception'

interface UserPermissionData {
  permission_id: number
  granted?: boolean
  expires_at?: string | null
}

@inject()
export default class SyncUserPermissionsService {
  constructor(private permissionRepository: PermissionRepository) {}

  async handle(userId: number, permissions: UserPermissionData[]): Promise<void> {
    const user = await User.find(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Prepare data for sync
    const syncData: Record<number, any> = {}

    permissions.forEach((perm) => {
      syncData[perm.permission_id] = {
        granted: perm.granted !== undefined ? perm.granted : true,
        expires_at: perm.expires_at ? DateTime.fromISO(perm.expires_at).toSQL() : null,
      }
    })

    // Sync permissions (this removes old permissions and adds new ones)
    await user.related('permissions').sync(syncData)
  }

  async attachPermission(
    userId: number,
    permissionId: number,
    granted: boolean = true,
    expiresAt?: string | null
  ): Promise<void> {
    const user = await User.find(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const pivotData = {
      granted,
      expires_at: expiresAt ? DateTime.fromISO(expiresAt).toSQL() : null,
    }

    // Attach or update if already exists
    const existing = await user
      .related('permissions')
      .pivotQuery()
      .where('permission_id', permissionId)
      .first()

    if (existing) {
      await user
        .related('permissions')
        .pivotQuery()
        .where('permission_id', permissionId)
        .update(pivotData)
    } else {
      await user.related('permissions').attach({
        [permissionId]: pivotData,
      })
    }
  }

  async revokePermission(userId: number, permissionId: number): Promise<void> {
    const user = await User.find(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    await user.related('permissions').detach([permissionId])
  }
}
