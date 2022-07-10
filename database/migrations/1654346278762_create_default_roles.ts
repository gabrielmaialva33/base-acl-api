import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { container } from 'tsyringe'

import { RoleServices } from 'App/Modules/Accounts/Services/Admin'

export default class extends BaseSchema {
  public async up() {
    const roleServices = container.resolve(RoleServices)
    await roleServices.storeDefault()
  }

  public async down() {
    this.schema.raw('truncate table roles restart identity cascade;')
  }
}
