import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import {
  BaseModel,
  beforeCreate,
  beforeFetch,
  beforeFind,
  beforePaginate,
  beforeSave,
  column,
} from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import * as model from '@adonisjs/lucid/types/model'

const AuthFinder = withAuthFinder(() => hash.use('argon'), {
  uids: ['email', 'username'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  static table = 'users'

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string

  @column()
  declare email: string

  @column()
  declare username: string | null

  @column({ serializeAs: null })
  declare password: string

  @column({ serializeAs: null })
  declare isDeleted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */

  /**
   * ------------------------------------------------------
   * Hooks
   * ------------------------------------------------------
   */
  @beforeFind()
  @beforeFetch()
  public static async softDeletes(query: model.ModelQueryBuilderContract<typeof User>) {
    query.where('is_deleted', false)
  }

  @beforePaginate()
  public static async softDeletesPaginate(
    queries: [
      countQuery: model.ModelQueryBuilderContract<typeof User>,
      fetchQuery: model.ModelQueryBuilderContract<typeof User>,
    ]
  ) {
    queries.forEach((query) => query.where('is_deleted', false))
  }

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }

  @beforeCreate()
  public static async setUsername(user: User) {
    if (!user.username) {
      user.username = user.email.split('@')[0].trim().toLowerCase()
    }
  }

  /**
   * ------------------------------------------------------
   * Query Scopes
   * ------------------------------------------------------
   */
}
