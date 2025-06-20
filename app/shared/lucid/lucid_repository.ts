import stringHelpers from '@adonisjs/core/helpers/string'
import { HttpContext } from '@adonisjs/core/http'
import { BaseModel } from '@adonisjs/lucid/orm'
import { ModelAttributes, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import ValidationException from '#exceptions/validation_exception'

import LucidRepositoryInterface, {
  DefaultOptions,
  ModelKeys,
  OrderDirection,
  PaginateOptions,
  PaginateResult,
} from '#shared/lucid/lucid_repository_interface'

export default class LucidRepository<T extends typeof BaseModel>
  implements LucidRepositoryInterface<T>
{
  static ORDER_ASC = 'asc' as const
  static ORDER_DESC = 'desc' as const
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
    return this.buildQuery({ field, value, opts }).first()
  }

  async list(opts?: DefaultOptions<T>): Promise<InstanceType<T>[]> {
    const query = this.buildQuery({ opts })

    query.orderBy(opts?.sortBy || this.DEFAULT_SORT, opts?.direction || this.DEFAULT_DIRECTION)

    return query
  }

  async paginate(options: PaginateOptions<T>): Promise<PaginateResult<T>> {
    const query = this.buildQuery({ opts: options })

    query.orderBy(options.sortBy || this.DEFAULT_SORT, options.direction || this.DEFAULT_DIRECTION)

    return query.paginate(
      options.page || this.DEFAULT_PAGE,
      options.perPage || this.DEFAULT_PER_PAGE
    )
  }

  async first(opts?: DefaultOptions<T>): Promise<InstanceType<T> | null> {
    return this.buildQuery({ opts }).first()
  }

  async count(opts?: DefaultOptions<T>): Promise<number> {
    const query = this.buildQuery({ opts })
    const rows = await query.count('* as count')
    return +rows[0].$extras.count
  }

  async firstOrCreate(
    search: Partial<ModelAttributes<InstanceType<T>>>,
    payload: Partial<ModelAttributes<InstanceType<T>>>
  ): Promise<InstanceType<T>> {
    return this.model.firstOrCreate(search, payload)
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

  /**
   * ------------------------------------------------------
   * Helpers
   * ------------------------------------------------------
   */
  protected validateSortBy(sort: string): void {
    const modelKeys = Array.from(this.model.$columnsDefinitions.keys())
    const modelKeysToSnakeCase = modelKeys.map((key) => stringHelpers.snakeCase(key))
    const allKeys = modelKeys.concat(modelKeysToSnakeCase)

    if (!allKeys.includes(sort)) {
      let message = `Invalid sort key: ${sort}. Must be one of: ${allKeys.join(', ')}`
      try {
        const { i18n } = HttpContext.getOrFail()
        message = i18n.t('errors.invalid_sort_key', {
          key: sort,
          available: allKeys.join(', '),
        })
      } catch {
        // HttpContext not available, use default message
      }
      throw new ValidationException(message)
    }
  }

  protected validateDirection(direction: string): void {
    if (direction !== LucidRepository.ORDER_ASC && direction !== LucidRepository.ORDER_DESC) {
      let message = `Invalid direction. Must be "${LucidRepository.ORDER_ASC}" or "${LucidRepository.ORDER_DESC}".`
      try {
        const { i18n } = HttpContext.getOrFail()
        message = i18n.t('errors.invalid_sort_direction', {
          asc: LucidRepository.ORDER_ASC,
          desc: LucidRepository.ORDER_DESC,
        })
      } catch {
        // HttpContext not available, use default message
      }
      throw new ValidationException(message)
    }
  }

  /**
   * Build a query with optional modifiers and scopes
   */
  protected buildQuery<K extends ModelKeys<T>>({
    field,
    value,
    opts,
  }: {
    field?: K
    value?: ModelAttributes<InstanceType<T>>[K]
    opts?: DefaultOptions<T>
  }): ModelQueryBuilderContract<T, InstanceType<T>> {
    const query = this.model.query()

    if (field && value) {
      query.where({ [field]: value })
    }

    if (opts) {
      const { modifyQuery, scopes } = opts

      if (modifyQuery) modifyQuery(query)
      if (scopes) query.withScopes(scopes)
    }

    return query
  }
}
