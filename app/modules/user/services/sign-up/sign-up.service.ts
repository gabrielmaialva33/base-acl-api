import { inject } from '@adonisjs/core'

import JwtAuthTokensService from '#modules/user/services/jwt/jwt-auth-tokens.service'
import UsersRepository from '#modules/user/repositories/users_repository'
import IUser from '#modules/user/interfaces/user_interface'

@inject()
export default class SignUpService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtAuthTokensService: JwtAuthTokensService
  ) {}

  async run(payload: IUser.CreatePayload) {
    const user = await this.usersRepository.create(payload)
    const auth = await this.jwtAuthTokensService.run({ userId: user.id })

    const userJson = user.toJSON()

    return { ...userJson, auth }
  }
}
