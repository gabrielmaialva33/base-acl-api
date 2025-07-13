import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#modules/user/models/user'

export default class AuditLog extends BaseModel {
  static table = 'audit_logs'

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  // User and session info
  @column()
  declare user_id: number | null

  @column()
  declare session_id: string | null

  @column()
  declare ip_address: string | null

  @column()
  declare user_agent: string | null

  // Permission info
  @column()
  declare resource: string

  @column()
  declare action: string

  @column()
  declare context: string | null

  @column()
  declare resource_id: number | null

  // Request info
  @column()
  declare method: string | null

  @column()
  declare url: string | null

  @column()
  declare request_data: Record<string, any> | null

  // Result info
  @column()
  declare result: 'granted' | 'denied'

  @column()
  declare reason: string | null

  @column()
  declare response_code: number | null

  // Additional metadata
  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime | null

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  declare user: BelongsTo<typeof User>

  /**
   * ------------------------------------------------------
   * Query Scopes
   * ------------------------------------------------------
   */
  static byUser = (query: any, userId: number) => {
    return query.where('user_id', userId)
  }

  static byResource = (query: any, resource: string) => {
    return query.where('resource', resource)
  }

  static byAction = (query: any, action: string) => {
    return query.where('action', action)
  }

  static byResult = (query: any, result: 'granted' | 'denied') => {
    return query.where('result', result)
  }

  static byDateRange = (query: any, startDate: DateTime, endDate: DateTime) => {
    return query.whereBetween('created_at', [startDate.toSQL(), endDate.toSQL()])
  }

  static byIpAddress = (query: any, ipAddress: string) => {
    return query.where('ip_address', ipAddress)
  }

  static recentFirst = (query: any) => {
    return query.orderBy('created_at', 'desc')
  }
}
