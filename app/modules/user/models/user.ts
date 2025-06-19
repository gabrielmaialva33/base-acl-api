import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import {
  afterCreate,
  BaseModel,
  beforeCreate,
  beforeFetch,
  beforeFind,
  beforePaginate,
  beforeSave,
  column,
  manyToMany,
} from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import * as model from '@adonisjs/lucid/types/model'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

import Role from '#modules/role/models/role'
import IRole from '#modules/role/interfaces/role_interface'

const AuthFinder = withAuthFinder(() => hash.use('argon'), {
  uids: ['email', 'username'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  static refreshTokens = DbAccessTokensProvider.forModel(User, {
    type: 'refresh_token',
    expiresIn: '3d',
  })

  static table = 'users'

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare full_name: string

  @column()
  declare email: string

  @column()
  declare username: string | null

  @column({ serializeAs: null })
  declare password: string

  @column({ serializeAs: null })
  declare is_deleted: boolean

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime | null

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @manyToMany(() => Role, {
    pivotTable: 'user_roles',
  })
  declare roles: ManyToMany<typeof Role>

  /**
   * ------------------------------------------------------
   * Hooks
   * ------------------------------------------------------
   */
  @beforeFind()
  @beforeFetch()
  static async softDeletes(query: model.ModelQueryBuilderContract<typeof User>) {
    query.where('is_deleted', false)
  }

  @beforePaginate()
  static async softDeletesPaginate(
    queries: [
      countQuery: model.ModelQueryBuilderContract<typeof User>,
      fetchQuery: model.ModelQueryBuilderContract<typeof User>,
    ]
  ) {
    queries.forEach((query) => query.where('is_deleted', false))
  }

  @beforeCreate()
  static async setUsername(user: User) {
    if (!user.username) {
      user.username = user.email.split('@')[0].trim().toLowerCase()
    }
  }

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password && !(await hash.isValidHash(user.password))) {
      user.password = await hash.make(user.password)
    }
  }

  @afterCreate()
  static async setDefaultRole(user: User) {
    const role = await Role.findBy('slug', IRole.Slugs.USER)
    if (role) {
      await user.related('roles').attach([role.id])
    }
  }

  /**
   * ------------------------------------------------------
   * Query Scopes
   * ------------------------------------------------------
   */
  static includeRoles(query: model.ModelQueryBuilderContract<typeof User>) {
    query.preload('roles')
  }

  /**
   * Override verifyCredentials to bypass soft delete hooks for authentication
   */
  static async verifyCredentials(uid: string, password: string) {
    const user = await this.query()
      .where((query) => {
        query.where('email', uid).orWhere('username', uid)
      })
      .where('is_deleted', false)
      .first()

    if (!user) {
      throw new Error('Invalid user credentials')
    }

    const isValidPassword = await hash.verify(user.password, password)
    if (!isValidPassword) {
      throw new Error('Invalid user credentials')
    }

    return user
  }
}
