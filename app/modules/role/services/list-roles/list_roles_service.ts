import { inject } from '@adonisjs/core'

import RolesRepository from '#modules/role/repositories/roles_repository'

@inject()
export default class ListRolesService {
  constructor(private rolesRepository: RolesRepository) {}

  async run() {
    return this.rolesRepository.list()
  }
}
