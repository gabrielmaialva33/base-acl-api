import { inject } from '@adonisjs/core'

import RolesRepository from '#modules/role/repositories/roles_repository'

@inject()
export default class ListRolesService {
  constructor(private rolesRepository: RolesRepository) {}

  async run(options?: { page?: number; perPage?: number }) {
    if (options?.page) {
      return this.rolesRepository.paginate({
        page: options.page,
        perPage: options.perPage || 10,
      })
    }
    const roles = await this.rolesRepository.list()
    return {
      data: roles,
      meta: {
        total: roles.length,
        perPage: roles.length,
        currentPage: 1,
        lastPage: 1,
        firstPage: 1,
        firstPageUrl: '/?page=1',
        lastPageUrl: '/?page=1',
        nextPageUrl: null,
        previousPageUrl: null,
      },
    }
  }
}
