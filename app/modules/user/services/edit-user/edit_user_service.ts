import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import IUser from '#modules/user/interfaces/user_interface'
import UsersRepository from '#modules/user/repositories/users_repository'
import NotFoundException from '#exceptions/not_found_exception'

@inject()
export default class EditUserService {
  constructor(private userRepository: UsersRepository) {}

  async run(id: number, payload: IUser.EditPayload) {
    const { i18n } = HttpContext.getOrFail()
    const user = await this.userRepository.findBy('id', id)
    if (!user)
      throw new NotFoundException(
        i18n.t('errors.not_found', {
          resource: i18n.t('models.user'),
        })
      )

    // Remove email and username from payload to prevent updates
    const { email, username, ...updateData } = payload as any

    await user.merge(updateData).save()

    return user
  }
}
