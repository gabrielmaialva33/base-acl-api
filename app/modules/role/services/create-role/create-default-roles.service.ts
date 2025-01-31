import { inject } from '@adonisjs/core'

import RolesRepository from '#modules/role/repositories/roles_repository'
import AvailableRoles from '#modules/role/defaults/available_roles'

@inject()
export default class CreateDefaultRolesService {
  constructor(private rolesRepository: RolesRepository) {}

  async run() {
    for (const role of AvailableRoles) {
      const r = await this.rolesRepository.findBy('slug', role.slug)
      if (!r) await this.rolesRepository.create(role)
    }
  }
}
