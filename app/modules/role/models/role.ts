import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import IRole from '#modules/role/interfaces/role_interface'

export default class Role extends BaseModel {
  static table = 'roles'

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
  declare slug: IRole.Slugs

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
