import stringHelpers from '@adonisjs/core/helpers/string'
import { BaseModel } from '@adonisjs/lucid/orm'
import { ModelAttributes, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

import {
  DefaultOptions,
  LucidRepositoryInterface,
  ModelKeys,
  OrderDirection,
  PaginateOptions,
  PaginateResult,
} from '../lucid/lucid_repository_interface'

export default class LucidRepository<T extends typeof BaseModel>
  implements LucidRepositoryInterface<T>
{
  protected DEFAULT_PAGE = 1
  protected DEFAULT_PER_PAGE = 10
  protected DEFAULT_SORT = 'id'
  protected DEFAULT_DIRECTION: OrderDirection = 'asc'

  constructor(protected model: T) {}

  /**
   * ------------------------------------------------------
   * CRUD
   * ------------------------------------------------------
   */
  async create(payload: Partial<ModelAttributes<InstanceType<T>>>): Promise<InstanceType<T>> {
    return this.model.create(payload)
  }

  async createMany(
    payload: Partial<ModelAttributes<InstanceType<T>>>[]
  ): Promise<InstanceType<T>[]> {
    return this.model.createMany(payload)
  }

  async findBy<K extends ModelKeys<T>>(
    field: K,
    value: ModelAttributes<InstanceType<T>>[K],
    opts?: DefaultOptions<T>
  ): Promise<InstanceType<T> | null> {
    const query = this.model.query().where({
      [field]: value,
    })
    if (opts) {
      const { modifyQuery, scopes } = opts

      if (modifyQuery) modifyQuery(query)
      if (scopes) query.withScopes(scopes)
    }

    return query.first()
  }

  async list(opts?: DefaultOptions<T>): Promise<InstanceType<T>[]> {
    const query = this.model.query()

    const {
      modifyQuery,
      scopes,
      direction = this.DEFAULT_DIRECTION,
      sortBy = this.DEFAULT_SORT,
    } = opts || {}

    if (modifyQuery) modifyQuery(query)
    if (scopes) query.withScopes(scopes)
    if (sortBy !== this.DEFAULT_SORT) this.validateSortBy(sortBy)
    if (direction !== this.DEFAULT_DIRECTION) this.validateDirection(direction)

    query.orderBy(sortBy, direction)

    return query
  }

  async paginate(options: PaginateOptions<T>): Promise<PaginateResult<T>> {
    const query = this.model.query()

    const {
      modifyQuery,
      scopes,
      direction = this.DEFAULT_DIRECTION,
      sortBy = this.DEFAULT_SORT,
    } = options

    if (modifyQuery) modifyQuery(query)
    if (scopes) query.withScopes(scopes)
    if (sortBy !== this.DEFAULT_SORT) this.validateSortBy(sortBy)
    if (direction !== this.DEFAULT_DIRECTION) this.validateDirection(direction)

    query.orderBy(sortBy, direction)

    return query.paginate(
      options.page || this.DEFAULT_PAGE,
      options.perPage || this.DEFAULT_PER_PAGE
    )
  }

  async first(opts?: DefaultOptions<T>): Promise<InstanceType<T> | null> {
    const query = this.model.query()

    if (opts) {
      const { modifyQuery, scopes } = opts

      if (modifyQuery) modifyQuery(query)
      if (scopes) query.withScopes(scopes)
    }

    return query.first()
  }

  async count(opts?: DefaultOptions<T>): Promise<number> {
    const query = this.model.query()

    if (opts) {
      const { modifyQuery, scopes } = opts

      if (modifyQuery) modifyQuery(query)
      if (scopes) query.withScopes(scopes)
    }

    const rows = await query.count('* as count')

    return +rows[0].$extras.count
  }

  async firstOrCreate(
    search: Partial<ModelAttributes<InstanceType<T>>>,
    payload: Partial<ModelAttributes<InstanceType<T>>>
  ): Promise<InstanceType<T>> {
    return this.model.firstOrCreate(search, payload)
  }

  /**
   * ------------------------------------------------------
   * Helpers
   * ------------------------------------------------------
   */
  protected validateSortBy(sort: string): void {
    const modelKeys = Array.from(this.model.$columnsDefinitions.keys())
    const modelKeysToSnakeCase = modelKeys.map((key) => stringHelpers.snakeCase(key))
    const allKeys = modelKeys.concat(modelKeysToSnakeCase)

    if (!allKeys.includes(sort))
      throw new Error(`Invalid sort key: ${sort}. Must be one of: ${allKeys.join(', ')}`)
  }

  protected validateDirection(direction: string): void {
    if (direction !== 'asc' && direction !== 'desc')
      throw new Error('Invalid direction. Must be "asc" or "desc".')
  }

  destroy<K extends ModelKeys<T>>(
    field: K,
    value: ModelAttributes<InstanceType<T>>[K]
  ): ModelQueryBuilderContract<T, InstanceType<T>> {
    return this.model
      .query()
      .where({ [field]: value })
      .delete()
  }
}
