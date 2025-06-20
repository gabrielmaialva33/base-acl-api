import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

import AssignDefaultPermissionsService from '#modules/permission/services/assign-permissions/assign_default_permissions_service'

export default class SyncPermissions extends BaseCommand {
  static commandName = 'permission:sync'
  static description = 'Sync default permissions and assign them to roles'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Starting permission sync...')

    try {
      const service = await this.app.container.make(AssignDefaultPermissionsService)
      await service.run()

      this.logger.success('✅ Permissions created and assigned to roles successfully!')
    } catch (error) {
      this.logger.error('❌ Failed to sync permissions')
      this.error = error
    }
  }
}
