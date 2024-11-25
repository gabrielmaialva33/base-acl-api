import { inject } from '@adonisjs/core'

import JwtService from '#shared/jwt/jwt_service'
import UsersRepository from '#modules/user/repositories/users_repository'
import env from '#start/env'

type GenerateAuthTokens = {
  user_id: number
  token: string | undefined
}

type GenerateAuthTokensResponse = {
  access_token: string
  refresh_token: string
}

@inject()
export default class GenerateAuthTokensService {
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository
  ) {}

  async run(userId: number): Promise<GenerateAuthTokensResponse> {
    const token = await this.usersRepository.generateToken(userId)
    const accessToken = await this.generateAccessToken({
      user_id: userId,
      token: token.value!.release(),
    })
    const refreshToken = await this.generateRefreshToken({
      user_id: userId,
      token: token.value!.release(),
    })

    return { access_token: accessToken, refresh_token: refreshToken }
  }

  private generateAccessToken(payload: GenerateAuthTokens): Promise<string> {
    return this.jwtService.sign(payload, env.get('ACCESS_TOKEN_SECRET'), '15m')
  }

  private generateRefreshToken(payload: GenerateAuthTokens): Promise<string> {
    return this.jwtService.sign(payload, env.get('REFRESH_TOKEN_SECRET'), '3d')
  }
}
