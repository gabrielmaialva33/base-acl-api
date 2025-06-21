import { inject } from '@adonisjs/core'
import { Database } from '@adonisjs/lucid/database'
import IOwnership from '#modules/ownership/interfaces/ownership_interface'
import User from '#modules/user/models/user'

@inject()
export default class OwnershipService {
  // Default ownership configuration
  private ownershipConfig: IOwnership.OwnershipConfig = {
    users: {
      resource: 'users',
      ownerField: 'id',
      ownerType: 'user',
      model: 'User',
    },
    files: {
      resource: 'files',
      ownerField: 'uploaded_by',
      ownerType: 'user',
      model: 'File',
    },
    posts: {
      resource: 'posts',
      ownerField: 'user_id',
      ownerType: 'user',
      model: 'Post',
    },
    comments: {
      resource: 'comments',
      ownerField: 'user_id',
      ownerType: 'user',
      model: 'Comment',
    },
  }

  constructor(private db: Database) {}

  /**
   * Check if user owns a resource
   */
  async checkOwnership(data: IOwnership.OwnershipCheck): Promise<boolean> {
    const { userId, resource, resourceId, context } = data

    // Get ownership rule for resource
    const rule = this.ownershipConfig[resource]
    if (!rule) {
      return false
    }

    // Check direct ownership
    if (context === 'own') {
      return await this.checkDirectOwnership(userId, resource, resourceId, rule)
    }

    // Check team ownership
    if (context === 'team') {
      return await this.checkTeamOwnership(userId, resource, resourceId, rule)
    }

    // Check department ownership
    if (context === 'department') {
      return await this.checkDepartmentOwnership(userId, resource, resourceId, rule)
    }

    return false
  }

  /**
   * Get ownership level for a user on a resource
   */
  async getOwnershipLevel(
    userId: number,
    resource: string,
    resourceId: number
  ): Promise<IOwnership.OwnershipLevel | null> {
    const rule = this.ownershipConfig[resource]
    if (!rule) {
      return null
    }

    // Check direct ownership
    if (await this.checkDirectOwnership(userId, resource, resourceId, rule)) {
      return IOwnership.OwnershipLevel.OWNER
    }

    // Check team membership
    if (await this.checkTeamOwnership(userId, resource, resourceId, rule)) {
      return IOwnership.OwnershipLevel.TEAM_MEMBER
    }

    // Check department membership
    if (await this.checkDepartmentOwnership(userId, resource, resourceId, rule)) {
      return IOwnership.OwnershipLevel.DEPARTMENT_MEMBER
    }

    // Check if user has any collaboration permissions
    if (await this.hasCollaborationPermissions(userId, resource, resourceId)) {
      return IOwnership.OwnershipLevel.COLLABORATOR
    }

    return null
  }

  /**
   * Get all resources owned by user
   */
  async getUserOwnedResources(
    userId: number,
    resource: string,
    options: {
      limit?: number
      offset?: number
      includeTeam?: boolean
      includeDepartment?: boolean
    } = {}
  ): Promise<any[]> {
    const rule = this.ownershipConfig[resource]
    if (!rule) {
      return []
    }

    const tableName = this.getTableName(resource)
    let query = this.db.from(tableName)

    if (options.includeTeam || options.includeDepartment) {
      // Complex query for team/department resources
      const userTeams = options.includeTeam
        ? await this.db
            .from('team_members')
            .where('user_id', userId)
            .select('team_id')
            .then((rows) => rows.map((r: any) => r.team_id))
        : []

      const userDepartments = options.includeDepartment
        ? await this.db
            .from('department_members')
            .where('user_id', userId)
            .select('department_id')
            .then((rows) => rows.map((r: any) => r.department_id))
        : []

      query = query.where((builder) => {
        builder.where(rule.ownerField, userId)

        if (userTeams.length > 0) {
          // Add team-based resources
          builder.orWhereIn(rule.ownerField, (subQuery) => {
            subQuery.from('team_members').whereIn('team_id', userTeams).select('user_id')
          })
        }

        if (userDepartments.length > 0) {
          // Add department-based resources
          builder.orWhereIn(rule.ownerField, (subQuery) => {
            subQuery
              .from('department_members')
              .whereIn('department_id', userDepartments)
              .select('user_id')
          })
        }
      })
    } else {
      query = query.where(rule.ownerField, userId)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.offset(options.offset)
    }

    return await query
  }

  /**
   * Transfer ownership of a resource
   */
  async transferOwnership(
    currentOwnerId: number,
    newOwnerId: number,
    resource: string,
    resourceId: number
  ): Promise<boolean> {
    const rule = this.ownershipConfig[resource]
    if (!rule) {
      return false
    }

    // Verify current ownership
    const isOwner = await this.checkDirectOwnership(currentOwnerId, resource, resourceId, rule)
    if (!isOwner) {
      return false
    }

    // Verify new owner exists
    const newOwner = await User.find(newOwnerId)
    if (!newOwner) {
      return false
    }

    // Transfer ownership
    const tableName = this.getTableName(resource)
    const updated = await this.db
      .from(tableName)
      .where('id', resourceId)
      .where(rule.ownerField, currentOwnerId)
      .update({ [rule.ownerField]: newOwnerId })

    return Array.isArray(updated) ? updated.length > 0 : updated > 0
  }

  /**
   * Add ownership rule for a resource
   */
  addOwnershipRule(resource: string, rule: IOwnership.OwnershipRule): void {
    this.ownershipConfig[resource] = rule
  }

  /**
   * Check direct ownership
   */
  private async checkDirectOwnership(
    userId: number,
    resource: string,
    resourceId: number,
    rule: IOwnership.OwnershipRule
  ): Promise<boolean> {
    // If custom check function exists, use it
    if (rule.customCheck) {
      return await rule.customCheck(userId, resourceId)
    }

    // Default database check
    const tableName = this.getTableName(resource)
    const record = await this.db
      .from(tableName)
      .where('id', resourceId)
      .where(rule.ownerField, userId)
      .first()

    return !!record
  }

  /**
   * Check team ownership
   */
  private async checkTeamOwnership(
    userId: number,
    resource: string,
    resourceId: number,
    rule: IOwnership.OwnershipRule
  ): Promise<boolean> {
    // First check if user owns the resource directly
    const isDirectOwner = await this.checkDirectOwnership(userId, resource, resourceId, rule)
    if (isDirectOwner) {
      return true
    }

    // Then check if user is in the same team as the owner
    const tableName = this.getTableName(resource)
    const resourceRecord = await this.db.from(tableName).where('id', resourceId).first()

    if (!resourceRecord) {
      return false
    }

    const ownerId = resourceRecord[rule.ownerField]
    if (!ownerId) {
      return false
    }

    // Check if both users are in the same team
    return await this.areInSameTeam(userId, ownerId)
  }

  /**
   * Check department ownership
   */
  private async checkDepartmentOwnership(
    userId: number,
    resource: string,
    resourceId: number,
    rule: IOwnership.OwnershipRule
  ): Promise<boolean> {
    // First check team ownership
    const isTeamOwner = await this.checkTeamOwnership(userId, resource, resourceId, rule)
    if (isTeamOwner) {
      return true
    }

    // Then check department ownership
    const tableName = this.getTableName(resource)
    const resourceRecord = await this.db.from(tableName).where('id', resourceId).first()

    if (!resourceRecord) {
      return false
    }

    const ownerId = resourceRecord[rule.ownerField]
    if (!ownerId) {
      return false
    }

    // Check if both users are in the same department
    return await this.areInSameDepartment(userId, ownerId)
  }

  /**
   * Check if two users are in the same team
   */
  private async areInSameTeam(userId1: number, userId2: number): Promise<boolean> {
    // This would be implemented based on your team structure
    // Example implementation:
    const user1Teams = await this.db
      .from('team_members')
      .where('user_id', userId1)
      .select('team_id')

    const user2Teams = await this.db
      .from('team_members')
      .where('user_id', userId2)
      .select('team_id')

    const user1TeamIds = user1Teams.map((t: any) => t.team_id)
    const user2TeamIds = user2Teams.map((t: any) => t.team_id)

    return user1TeamIds.some((teamId: any) => user2TeamIds.includes(teamId))
  }

  /**
   * Check if two users are in the same department
   */
  private async areInSameDepartment(userId1: number, userId2: number): Promise<boolean> {
    // This would be implemented based on your department structure
    // Example implementation:
    const user1Departments = await this.db
      .from('department_members')
      .where('user_id', userId1)
      .select('department_id')

    const user2Departments = await this.db
      .from('department_members')
      .where('user_id', userId2)
      .select('department_id')

    const user1DeptIds = user1Departments.map((d: any) => d.department_id)
    const user2DeptIds = user2Departments.map((d: any) => d.department_id)

    return user1DeptIds.some((deptId: any) => user2DeptIds.includes(deptId))
  }

  /**
   * Check if user has collaboration permissions
   */
  private async hasCollaborationPermissions(
    _userId: number,
    _resource: string,
    _resourceId: number
  ): Promise<boolean> {
    // This would check if user has been granted specific permissions on this resource
    // Implementation depends on your collaboration system
    return false
  }

  /**
   * Get table name from resource
   */
  private getTableName(resource: string): string {
    // Convert resource name to table name
    // This is a simple implementation - you might need more sophisticated mapping
    return resource
  }
}
