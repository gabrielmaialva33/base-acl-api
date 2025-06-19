import { healthChecks } from '#start/health'
import type { HttpContext } from '@adonisjs/core/http'

export default class HealthChecksController {
  async handle({ response }: HttpContext) {
    const report = await healthChecks.run()

    // Transform the report to match expected format
    const healthResponse = {
      healthy: report.isHealthy,
      services: {
        database: {
          healthy: report.checks.some(
            (check) => check.name.includes('Database') && check.status === 'ok'
          ),
        },
      },
    }

    if (report.isHealthy) {
      return response.ok(healthResponse)
    }

    return response.serviceUnavailable(healthResponse)
  }
}
