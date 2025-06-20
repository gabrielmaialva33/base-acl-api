import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import CreateDefaultPermissionsService from '#modules/permission/services/create-permission/create_default_permissions_service'

export default class SyncPermissions extends BaseCommand {
  static commandName = 'permission:sync'
  static description = 'Sync default permissions in the database'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Starting permission sync...')

    try {
      const service = await this.app.container.make(CreateDefaultPermissionsService)
      await service.run()

      this.logger.success('✅ Permissions synced successfully!')
    } catch (error) {
      this.logger.error('❌ Failed to sync permissions')
      this.error = error
    }
  }
}
