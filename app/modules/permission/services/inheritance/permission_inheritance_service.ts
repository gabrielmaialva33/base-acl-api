import { inject } from '@adonisjs/core'
import IRole from '#modules/role/interfaces/role_interface'
import Permission from '#modules/permission/models/permission'
import Role from '#modules/role/models/role'

@inject()
export default class PermissionInheritanceService {
  /**
   * Get all inherited permissions for a role based on hierarchy
   */
  async getInheritedPermissions(roleSlug: string): Promise<Permission[]> {
    const childRoles = this.getChildRoles(roleSlug)
    if (childRoles.length === 0) {
      return []
    }

    const permissions = await Permission.query()
      .whereHas('roles', (query) => {
        query.whereIn('slug', childRoles)
      })
      .distinct()

    return permissions
  }

  /**
   * Get all effective permissions for a role (direct + inherited)
   */
  async getEffectivePermissions(roleSlug: string): Promise<Permission[]> {
    const role = await Role.query().where('slug', roleSlug).preload('permissions').first()

    if (!role) {
      return []
    }

    const directPermissions = role.permissions
    const inheritedPermissions = await this.getInheritedPermissions(roleSlug)

    // Remove duplicates by permission ID
    const permissionMap = new Map<number, Permission>()

    directPermissions.forEach((permission) => {
      permissionMap.set(permission.id, permission)
    })

    inheritedPermissions.forEach((permission) => {
      if (!permissionMap.has(permission.id)) {
        permissionMap.set(permission.id, permission)
      }
    })

    return Array.from(permissionMap.values())
  }

  /**
   * Check if a role can inherit from another role
   */
  canInheritFrom(parentRole: string, childRole: string): boolean {
    const childRoles = this.getChildRoles(parentRole)
    return childRoles.includes(childRole)
  }

  /**
   * Get all parent roles for a given role
   */
  getParentRoles(roleSlug: string): string[] {
    const parents: string[] = []

    Object.entries(IRole.ROLE_HIERARCHY).forEach(([parent, children]) => {
      if (children.includes(roleSlug)) {
        parents.push(parent)
      }
    })

    return parents
  }

  /**
   * Sync inherited permissions for a role
   * This method ensures role hierarchy is maintained
   */
  async syncInheritedPermissions(roleSlug: string): Promise<void> {
    const role = await Role.query().where('slug', roleSlug).first()
    if (!role) {
      return
    }

    const effectivePermissions = await this.getEffectivePermissions(roleSlug)
    const permissionIds = effectivePermissions.map((p) => p.id)

    await role.related('permissions').sync(permissionIds)
  }

  /**
   * Validate role hierarchy integrity
   */
  validateHierarchy(): boolean {
    const roles = Object.keys(IRole.ROLE_HIERARCHY)

    // Check for circular dependencies
    for (const role of roles) {
      if (this.hasCircularDependency(role, new Set())) {
        return false
      }
    }

    return true
  }

  /**
   * Get all child roles for a given role
   */
  private getChildRoles(roleSlug: string): string[] {
    return IRole.ROLE_HIERARCHY[roleSlug] || []
  }

  /**
   * Check for circular dependencies in role hierarchy
   */
  private hasCircularDependency(role: string, visited: Set<string>): boolean {
    if (visited.has(role)) {
      return true
    }

    visited.add(role)
    const childRoles = this.getChildRoles(role)

    for (const childRole of childRoles) {
      if (this.hasCircularDependency(childRole, new Set(visited))) {
        return true
      }
    }

    return false
  }
}
