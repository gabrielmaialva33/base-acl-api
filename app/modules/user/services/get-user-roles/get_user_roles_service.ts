import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import UsersRepository from '#modules/user/repositories/users_repository'
import NotFoundException from '#exceptions/not_found_exception'

@inject()
export default class GetUserRolesService {
  constructor(private usersRepository: UsersRepository) {}

  async run(userId: number) {
    const { i18n } = HttpContext.getOrFail()

    const user = await this.usersRepository.findBy('id', userId)
    if (!user) {
      throw new NotFoundException(
        i18n.t('errors.not_found', {
          resource: i18n.t('models.user'),
        })
      )
    }

    await user.load('roles', (query) => {
      query.select('id', 'name', 'description', 'created_at', 'updated_at')
      query.orderBy('name')
    })

    const roles = user.roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      created_at: role.created_at,
      updated_at: role.updated_at,
      assigned_at: role.$extras.pivot_created_at,
    }))

    return {
      total: roles.length,
      roles,
    }
  }
}
