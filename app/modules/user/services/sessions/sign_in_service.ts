import { inject } from '@adonisjs/core'

import UsersRepository from '#modules/user/repositories/users_repository'
import JwtAuthTokensService from '#modules/user/services/jwt/jwt_auth_tokens_service'

type SignInRequest = {
  uid: string
  password: string
}

@inject()
export default class SignInService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtAuthTokensService: JwtAuthTokensService
  ) {}

  async run({ uid, password }: SignInRequest) {
    const user = await this.usersRepository.verifyCredentials(uid, password)

    const auth = await this.jwtAuthTokensService.run({ userId: user.id })
    const userJson = user.toJSON()

    return { ...userJson, auth }
  }
}
