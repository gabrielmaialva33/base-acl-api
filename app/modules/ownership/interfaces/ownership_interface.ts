namespace IOwnership {
  export interface ResourceOwnership {
    userId: number
    resource: string
    resourceId: number
    ownerId: number
    ownerType?: 'user' | 'team' | 'department'
    permissions?: string[]
    metadata?: Record<string, any>
  }

  export interface OwnershipCheck {
    userId: number
    resource: string
    resourceId: number
    action: string
    context: string
  }

  export interface OwnershipRule {
    resource: string
    ownerField: string
    ownerType: 'user' | 'team' | 'department'
    model: string
    customCheck?: (userId: number, resourceId: number) => Promise<boolean>
  }

  export interface TeamMembership {
    userId: number
    teamId: number
    role: string
    permissions?: string[]
  }

  export interface DepartmentMembership {
    userId: number
    departmentId: number
    role: string
    permissions?: string[]
  }

  export enum OwnershipLevel {
    OWNER = 'owner',
    TEAM_MEMBER = 'team_member',
    DEPARTMENT_MEMBER = 'department_member',
    COLLABORATOR = 'collaborator',
    VIEWER = 'viewer',
  }

  export interface OwnershipConfig {
    [resource: string]: OwnershipRule
  }
}

export default IOwnership
