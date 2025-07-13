import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AuditLog from '../models/audit_log.js'

export interface AuditLogData {
  userId?: number
  sessionId?: string
  resource: string
  action: string
  context?: string
  resourceId?: number
  result: 'granted' | 'denied'
  reason?: string
  metadata?: Record<string, any>
}

@inject()
export default class AuditService {
  /**
   * Log permission check result
   */
  async logPermissionCheck(data: AuditLogData, ctx?: HttpContext): Promise<AuditLog> {
    const auditData: Partial<AuditLog> = {
      user_id: data.userId || null,
      session_id: data.sessionId || null,
      resource: data.resource,
      action: data.action,
      context: data.context || null,
      resource_id: data.resourceId || null,
      result: data.result,
      reason: data.reason || null,
      metadata: data.metadata || null,
    }

    // Add request context if available
    if (ctx) {
      auditData.ip_address = ctx.request.ip()
      auditData.user_agent = ctx.request.header('User-Agent') || null
      auditData.method = ctx.request.method()
      auditData.url = ctx.request.url()
      auditData.response_code = ctx.response.getStatus()

      // Capture relevant request data (excluding sensitive info)
      auditData.request_data = this.sanitizeRequestData(ctx.request.all())
    }

    return await AuditLog.create(auditData)
  }

  /**
   * Get audit logs for a user
   */
  async getUserAuditLogs(
    userId: number,
    options: {
      limit?: number
      offset?: number
      resource?: string
      action?: string
      result?: 'granted' | 'denied'
      startDate?: Date
      endDate?: Date
    } = {}
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const query = AuditLog.query().where('user_id', userId).orderBy('created_at', 'desc')

    if (options.resource) {
      query.where('resource', options.resource)
    }

    if (options.action) {
      query.where('action', options.action)
    }

    if (options.result) {
      query.where('result', options.result)
    }

    if (options.startDate && options.endDate) {
      query.whereBetween('created_at', [options.startDate, options.endDate])
    }

    const totalQuery = query.clone()
    const total = await totalQuery.count('* as total')

    if (options.limit) {
      query.limit(options.limit)
    }

    if (options.offset) {
      query.offset(options.offset)
    }

    const logs = await query.preload('user')

    return {
      logs,
      total: total[0].$extras.total,
    }
  }

  /**
   * Get security alerts based on audit logs
   */
  async getSecurityAlerts(
    options: {
      hours?: number
      maxFailedAttempts?: number
      suspiciousIps?: string[]
    } = {}
  ): Promise<any[]> {
    const { hours = 24, maxFailedAttempts = 5, suspiciousIps = [] } = options
    const alerts: any[] = []

    // Check for repeated failed attempts
    const failedAttempts = await AuditLog.query()
      .where('result', 'denied')
      .where('created_at', '>=', new Date(Date.now() - hours * 60 * 60 * 1000))
      .groupBy('user_id', 'ip_address')
      .select('user_id', 'ip_address')
      .count('* as attempts')
      .having('attempts', '>=', maxFailedAttempts)

    failedAttempts.forEach((attempt: any) => {
      alerts.push({
        type: 'repeated_failed_attempts',
        severity: 'high',
        userId: attempt.user_id,
        ipAddress: attempt.ip_address,
        attempts: attempt.$extras.attempts,
        description: `${attempt.$extras.attempts} failed permission attempts in ${hours} hours`,
      })
    })

    // Check for suspicious IPs
    if (suspiciousIps.length > 0) {
      const suspiciousActivity = await AuditLog.query()
        .whereIn('ip_address', suspiciousIps)
        .where('created_at', '>=', new Date(Date.now() - hours * 60 * 60 * 1000))
        .groupBy('ip_address')
        .select('ip_address')
        .count('* as activity')

      suspiciousActivity.forEach((activity: any) => {
        alerts.push({
          type: 'suspicious_ip_activity',
          severity: 'medium',
          ipAddress: activity.ip_address,
          activity: activity.$extras.activity,
          description: `Activity detected from suspicious IP: ${activity.ip_address}`,
        })
      })
    }

    return alerts
  }

  /**
   * Generate audit report
   */
  async generateReport(options: {
    startDate: Date
    endDate: Date
    userId?: number
    resource?: string
    groupBy?: 'user' | 'resource' | 'action' | 'day'
  }): Promise<any> {
    const { startDate, endDate, userId, resource, groupBy = 'day' } = options

    const query = AuditLog.query().whereBetween('created_at', [startDate, endDate])

    if (userId) {
      query.where('user_id', userId)
    }

    if (resource) {
      query.where('resource', resource)
    }

    switch (groupBy) {
      case 'user':
        return await query
          .groupBy('user_id')
          .select('user_id')
          .count('* as total')
          .countDistinct('resource as resources_accessed')
          .preload('user')

      case 'resource':
        return await query
          .groupBy('resource')
          .select('resource')
          .count('* as total')
          .countDistinct('user_id as unique_users')

      case 'action':
        return await query
          .groupBy('action')
          .select('action')
          .count('* as total')
          .countDistinct('user_id as unique_users')

      case 'day':
      default:
        return await query
          .groupByRaw('DATE(created_at)')
          .select('created_at')
          .count('* as total')
          .countDistinct('user_id as unique_users')
          .orderBy('created_at')
    }
  }

  /**
   * Clean up old audit logs
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)

    const deletedCount = await AuditLog.query().where('created_at', '<', cutoffDate).delete()

    return deletedCount[0]
  }

  /**
   * Sanitize request data to remove sensitive information
   */
  private sanitizeRequestData(data: Record<string, any>): Record<string, any> {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'cookie']
    const sanitized: Record<string, any> = {}

    Object.keys(data).forEach((key) => {
      const lowerKey = key.toLowerCase()
      const isSensitive = sensitiveFields.some((field) => lowerKey.includes(field))

      if (isSensitive) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = data[key]
      }
    })

    return sanitized
  }
}
