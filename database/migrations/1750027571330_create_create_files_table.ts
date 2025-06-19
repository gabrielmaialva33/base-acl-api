import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'files'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('owner_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('client_name').notNullable()
      table.string('file_name').notNullable()
      table.integer('file_size').notNullable()
      table.string('file_type').notNullable()
      table.string('file_category').notNullable()
      table.string('url').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
