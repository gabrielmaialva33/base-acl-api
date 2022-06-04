import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Logger from '@ioc:Adonis/Core/Logger'

export default class extends BaseSchema {
  protected tableName = 'roles'

  public async up() {
    if (!(await this.schema.hasTable(this.tableName)))
      this.schema.createTable(this.tableName, (table) => {
        table.uuid('id').primary().defaultTo(this.db.rawQuery('uuid_generate_v4()').knexQuery)

        table.string('slug', 80).notNullable()
        table.string('name', 40).notNullable()
        table.text('description').nullable()

        table.boolean('deletable').notNullable().defaultTo(true)
        table.boolean('is_active').notNullable().defaultTo(true)
        table.boolean('is_deleted').notNullable().defaultTo(false)

        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
        table.timestamp('deleted_at', { useTz: true }).defaultTo(null)
      })
    else Logger.info('Roles migration already running')
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
