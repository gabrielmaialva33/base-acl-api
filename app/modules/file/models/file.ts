import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#modules/user/models/user'

export default class File extends BaseModel {
  static table = 'files'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare owner_id: number

  @column()
  declare client_name: string

  @column()
  declare file_name: string

  @column()
  declare file_size: number

  @column()
  declare file_type: string

  @column()
  declare file_category: string

  @column()
  declare url: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => User, {
    foreignKey: 'owner_id',
  })
  declare owner: BelongsTo<typeof User>
}
