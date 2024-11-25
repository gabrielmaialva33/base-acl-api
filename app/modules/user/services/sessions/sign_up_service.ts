import { inject } from '@adonisjs/core'

import IUser from '#modules/user/interfaces/user_interface'
import UsersRepository from '#modules/user/repositories/users_repository'
import AccessTokensService from '#modules/user/services/access_tokens/access_tokens_service'

@inject()
export default class SignUpService {
  constructor(
    private usersRepository: UsersRepository,
    private accessTokensService: AccessTokensService
  ) {}

  async run(payload: IUser.CreatePayload) {
    const user = await this.usersRepository.create(payload)
    const auth = await this.accessTokensService.run(user.id)

    const userJson = user.toJSON()

    return { ...userJson, auth }
  }
}
