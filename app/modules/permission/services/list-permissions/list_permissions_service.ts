import { inject } from '@adonisjs/core'
import Permission from '#modules/permission/models/permission'
import PermissionRepository from '#modules/permission/repositories/permission_repository'

@inject()
export default class ListPermissionsService {
  constructor(private permissionRepository: PermissionRepository) {}

  async handle(page: number = 1, perPage: number = 10, resource?: string, action?: string) {
    const query = Permission.query()

    if (resource) {
      query.where('resource', resource)
    }

    if (action) {
      query.where('action', action)
    }

    return await query.orderBy('resource', 'asc').orderBy('action', 'asc').paginate(page, perPage)
  }
}
