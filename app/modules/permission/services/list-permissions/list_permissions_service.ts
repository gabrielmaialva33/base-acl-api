import { inject } from '@adonisjs/core'
import Permission from '#modules/permission/models/permission'

@inject()
export default class ListPermissionsService {
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
