import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/limiter'

const limiterConfig = defineConfig({
  default: env.get('LIMITER_STORE', 'redis'),

  /**
   * Configuration for different storage backends
   */
  stores: {
    /**
     * Redis store for production use
     */
    redis: stores.redis({
      connectionName: 'main',
      rejectIfRedisNotReady: false,
    }),

    /**
     * Database store for persistent rate limiting
     */
    database: stores.database({
      tableName: 'rate_limits',
      clearExpiredByTimeout: true,
    }),

    /**
     * Memory store for development and testing
     */
    memory: stores.memory({}),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
