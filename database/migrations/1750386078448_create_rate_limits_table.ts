import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rate_limits'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('key', 255).notNullable().index()
      table.integer('points').notNullable()
      table.integer('expire').unsigned()
      table.primary(['key'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
