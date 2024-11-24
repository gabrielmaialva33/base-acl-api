import RolesRepository from '#modules/role/repositories/roles_repository'
import { inject } from '@adonisjs/core'

@inject()
export default class ListRolesService {
  constructor(private rolesRepository: RolesRepository) {}

  async run() {
    return this.rolesRepository.list()
  }
}
