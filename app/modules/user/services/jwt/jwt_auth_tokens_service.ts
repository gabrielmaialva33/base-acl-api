import { inject } from '@adonisjs/core'

import JwtService from '#shared/jwt/jwt_service'
import env from '#start/env'

type GenerateAuthTokens = {
  user_id: number
}

type GenerateAuthTokensResponse = {
  access_token: string
  refresh_token: string
}

@inject()
export default class JwtAuthTokensService {
  constructor(private jwtService: JwtService) {}

  async run(userId: number): Promise<GenerateAuthTokensResponse> {
    const accessToken = await this.generateAccessToken({
      user_id: userId,
    })
    const refreshToken = await this.generateRefreshToken({
      user_id: userId,
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
