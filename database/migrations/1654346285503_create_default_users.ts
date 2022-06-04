import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { storeDefaultUser } from 'App/Modules/Accounts/Services/User'

export default class extends BaseSchema {
  public async up() {
    await storeDefaultUser()
  }

  public async down() {
    this.schema.raw('truncate table users restart identity cascade;')
  }
}
