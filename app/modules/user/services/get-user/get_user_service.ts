import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import UsersRepository from '#modules/user/repositories/users_repository'
import NotFoundException from '#exceptions/not_found_exception'

@inject()
export default class GetUserService {
  constructor(private usersRepository: UsersRepository) {}

  async run(id: number) {
    const { i18n } = HttpContext.getOrFail()
    const user = await this.usersRepository.findBy('id', id)
    if (!user)
      throw new NotFoundException(
        i18n.t('errors.not_found', {
          resource: i18n.t('models.user'),
        })
      )

    await user.load('roles')

    return user
  }
}
