import { BaseSchema } from '@adonisjs/lucid/schema'
import app from '@adonisjs/core/services/app'

import CreateDefaultRolesService from '#modules/role/services/create-role/create_default_roles_service'

export default class extends BaseSchema {
  async up() {
    const service = await app.container.make(CreateDefaultRolesService)
    await service.run()
  }

  async down() {
    this.schema.raw('TRUNCATE TABLE roles CASCADE')
  }
}
