import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

import Role from '#modules/role/models/role'
import User from '#modules/user/models/user'

export default class Permission extends BaseModel {
  static table = 'permissions'

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare resource: string

  @column()
  declare action: string

  @column()
  declare context: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @manyToMany(() => Role, {
    pivotTable: 'role_permissions',
    pivotTimestamps: true,
  })
  declare roles: ManyToMany<typeof Role>

  @manyToMany(() => User, {
    pivotTable: 'user_permissions',
    pivotTimestamps: true,
    pivotColumns: ['granted', 'expires_at'],
  })
  declare users: ManyToMany<typeof User>

  /**
   * ------------------------------------------------------
   * Hooks
   * ------------------------------------------------------
   */
  @beforeCreate()
  static async generateName(permission: Permission) {
    if (!permission.name) {
      const context = permission.context || 'any'
      permission.name = `${permission.resource}.${permission.action}.${context}`
    }
  }

  /**
   * ------------------------------------------------------
   * Query Scopes
   * ------------------------------------------------------
   */
  static byResource = (query: any, resource: string) => {
    return query.where('resource', resource)
  }

  static byAction = (query: any, action: string) => {
    return query.where('action', action)
  }

  static byContext = (query: any, context: string) => {
    return query.where('context', context)
  }

  static byResourceActionContext = (
    query: any,
    resource: string,
    action: string,
    context: string = 'any'
  ) => {
    return query.where('resource', resource).where('action', action).where('context', context)
  }
}
