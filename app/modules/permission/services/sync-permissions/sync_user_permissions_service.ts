import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#modules/user/models/user'
import NotFoundException from '#exceptions/not_found_exception'

interface UserPermissionData {
  permission_id: number
  granted?: boolean
  expires_at?: string | null
}

@inject()
export default class SyncUserPermissionsService {
  async handle(userId: number, permissions: UserPermissionData[]): Promise<void> {
    const { i18n } = HttpContext.getOrFail()
    const user = await User.find(userId)
    if (!user) {
      throw new NotFoundException(
        i18n.t('errors.not_found', {
          resource: i18n.t('models.user'),
        })
      )
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
    const { i18n } = HttpContext.getOrFail()
    const user = await User.find(userId)
    if (!user) {
      throw new NotFoundException(
        i18n.t('errors.not_found', {
          resource: i18n.t('models.user'),
        })
      )
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
    const { i18n } = HttpContext.getOrFail()
    const user = await User.find(userId)
    if (!user) {
      throw new NotFoundException(
        i18n.t('errors.not_found', {
          resource: i18n.t('models.user'),
        })
      )
    }

    await user.related('permissions').detach([permissionId])
  }
}
