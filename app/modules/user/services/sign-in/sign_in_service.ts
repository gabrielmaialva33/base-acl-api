import { inject } from '@adonisjs/core'

import JwtAuthTokensService from '#modules/user/services/jwt/jwt_auth_tokens_service'
import UsersRepository from '#modules/user/repositories/users_repository'

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
    await user.load('roles')

    const auth = await this.jwtAuthTokensService.run({ userId: user.id })
    const userJson = user.toJSON()

    return { ...userJson, auth }
  }
}
