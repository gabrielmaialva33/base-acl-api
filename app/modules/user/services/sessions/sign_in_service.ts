import { inject } from '@adonisjs/core'

import UsersRepository from '#modules/user/repositories/users_repository'
import AccessTokensService from '#modules/user/services/access_tokens/access_tokens_service'

type SignInRequest = {
  uid: string
  password: string
}

@inject()
export default class SignInService {
  constructor(
    private usersRepository: UsersRepository,
    private accessTokensService: AccessTokensService
  ) {}

  async run({ uid, password }: SignInRequest) {
    const user = await this.usersRepository.verifyCredentials(uid, password)

    const payload = await this.accessTokensService.run(user.id)

    return { ...user.toJSON(), auth: payload }
  }
}
