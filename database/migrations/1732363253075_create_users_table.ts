import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable().primary()

      table.string('full_name').notNullable()

      table.string('email', 254).notNullable().unique()
      table.string('username', 80).nullable().unique()
      table.string('password').notNullable()

      table.boolean('is_deleted').defaultTo(false)

      table.jsonb('metadata').defaultTo(
        JSON.stringify({
          email_verified: false,
          email_verification_token: null,
          email_verification_sent_at: null,
          email_verified_at: null,
        })
      )

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
