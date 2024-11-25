import { inject } from '@adonisjs/core'
import UsersRepository from '#modules/user/repositories/users_repository'

type AccessTokenResponse = {
  access_token: string
  refresh_token: string
}

@inject()
export default class AccessTokensService {
  constructor(private usersRepository: UsersRepository) {}

  async run(userId: number) {
    const accessToken = await this.usersRepository.generateAccessToken(userId)
    const refreshToken = await this.usersRepository.generateRefreshToken(userId)

    const payload: AccessTokenResponse = {
      access_token: accessToken.value!.release(),
      refresh_token: refreshToken.value!.release(),
    }

    return payload
  }
}
