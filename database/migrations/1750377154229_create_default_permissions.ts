import { BaseSchema } from '@adonisjs/lucid/schema'
import app from '@adonisjs/core/services/app'

import AssignDefaultPermissionsService from '#modules/permission/services/assign-permissions/assign_default_permissions_service'

export default class extends BaseSchema {
  async up() {
    const service = await app.container.make(AssignDefaultPermissionsService)
    await service.run()
  }

  async down() {
    // Remove all permission associations
    this.db.raw('TRUNCATE TABLE role_permissions CASCADE')
    this.db.raw('TRUNCATE TABLE user_permissions CASCADE')
    this.db.raw('TRUNCATE TABLE permissions CASCADE')
  }
}
