import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audit_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // User and session info
      table.integer('user_id').unsigned().nullable()
      table.string('session_id', 100).nullable()
      table.string('ip_address', 45).nullable()
      table.string('user_agent', 500).nullable()

      // Permission info
      table.string('resource', 100).notNullable()
      table.string('action', 50).notNullable()
      table.string('context', 50).nullable()
      table.integer('resource_id').unsigned().nullable()

      // Request info
      table.string('method', 10).nullable()
      table.string('url', 500).nullable()
      table.json('request_data').nullable()

      // Result info
      table.enum('result', ['granted', 'denied']).notNullable()
      table.string('reason', 255).nullable()
      table.integer('response_code').nullable()

      // Additional metadata
      table.json('metadata').nullable()

      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()

      // Indexes for performance
      table.index(['user_id', 'created_at'], 'idx_audit_logs_user_date')
      table.index(['resource', 'action'], 'idx_audit_logs_resource_action')
      table.index(['result', 'created_at'], 'idx_audit_logs_result_date')
      table.index(['ip_address', 'created_at'], 'idx_audit_logs_ip_date')

      // Foreign keys
      table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
