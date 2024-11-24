import { BaseModel } from '@adonisjs/lucid/orm'
import {
  ExtractScopes,
  LucidModel,
  LucidRow,
  ModelAttributes,
  ModelPaginatorContract,
  ModelQueryBuilderContract,
} from '@adonisjs/lucid/types/model'
import { SimplePaginatorContract } from '@adonisjs/lucid/types/querybuilder'

/**
 * Repository interface for working with AdonisJS Lucid models.
 * Provides a consistent API for common CRUD operations and query enhancements.
 */
export default interface LucidRepositoryInterface<T extends typeof BaseModel> {
  /**
   * Create a new model instance.
   * @param payload - The attributes to initialize the model with.
   */
  create(payload: Partial<ModelAttributes<InstanceType<T>>>): Promise<InstanceType<T>>

  /**
   * Create multiple model instances in a single operation.
   * @param payload - Array of attributes for each model instance.
   */
  createMany(payload: Partial<ModelAttributes<InstanceType<T>>>[]): Promise<InstanceType<T>[]>

  /**
   * Find a model by a specific field and value.
   * @param field - The field to search by.
   * @param value - The value to match.
   * @param opts - Additional query options.
   */
  findBy<K extends ModelKeys<T>>(
    field: K,
    value: ModelAttributes<InstanceType<T>>[K],
    opts?: DefaultOptions<T>
  ): Promise<InstanceType<T> | null>

  /**
   * Get the first record matching the query.
   * @param opts - Additional query options.
   */
  first(opts?: DefaultOptions<T>): Promise<InstanceType<T> | null>

  /**
   * List all records matching the query.
   * @param opts - Additional query options.
   */
  list(opts?: DefaultOptions<T>): Promise<InstanceType<T>[]>

  /**
   * Paginate the results of a query.
   * @param options - Pagination and query options.
   */
  paginate(options?: PaginateOptions<T>): Promise<PaginateResult<T>>

  /**
   * Count the number of records matching the query.
   * @param opts - Additional query options.
   */
  count(opts?: DefaultOptions<T>): Promise<number>

  /**
   * Find a record matching the search criteria, or create a new one.
   * @param search - Criteria to search for.
   * @param payload - Attributes to create if no record matches.
   */
  firstOrCreate(
    search: Partial<ModelAttributes<InstanceType<T>>>,
    payload: Partial<ModelAttributes<InstanceType<T>>>
  ): Promise<InstanceType<T>>

  /**
   * Delete records matching a specific field and value.
   * @param field - The field to search by.
   * @param value - The value to match.
   */
  destroy<K extends ModelKeys<T>>(
    field: K,
    value: ModelAttributes<InstanceType<T>>[K]
  ): ModelQueryBuilderContract<T, InstanceType<T>>
}

/**
 * Type representing the keys of a model's attributes.
 */
export type ModelKeys<T extends typeof BaseModel> = keyof ModelAttributes<InstanceType<T>>

/**
 * Default options for modifying queries.
 */
export interface DefaultOptions<T extends typeof BaseModel> {
  /**
   * Function to apply custom modifications to the query.
   */
  modifyQuery?: (query: ModelQueryBuilderContract<T, InstanceType<T>>) => void

  /**
   * Function to apply model-specific scopes.
   */
  scopes?: <Scopes extends ExtractScopes<T>>(scopes: Scopes) => void

  /**
   * Field to sort the results by.
   */
  sortBy?: string

  /**
   * Sorting direction, either ascending or descending.
   */
  direction?: OrderDirection
}

/**
 * Sorting direction types.
 */
export type OrderDirection = 'asc' | 'desc'

/**
 * Options for paginating query results.
 */
export interface PaginateOptions<T extends typeof BaseModel> extends DefaultOptions<T> {
  /**
   * The current page number.
   */
  page?: number

  /**
   * Number of records per page.
   */
  perPage?: number
}

/**
 * Result type for paginated queries.
 */
export type PaginateResult<Model extends LucidModel> =
  | ModelPaginatorContract<LucidRow & InstanceType<Model>>
  | SimplePaginatorContract<InstanceType<Model>>
