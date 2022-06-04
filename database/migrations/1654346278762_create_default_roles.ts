import BaseSchema from '@ioc:Adonis/Lucid/Schema'

import { storeDefaultRole } from 'App/Modules/Accounts/Services/Role'

export default class extends BaseSchema {
  public async up() {
    await storeDefaultRole()
  }

  public async down() {
    this.schema.raw('truncate table roles restart identity cascade;')
  }
}
