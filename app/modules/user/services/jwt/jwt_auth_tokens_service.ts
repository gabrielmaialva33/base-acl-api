import { inject } from '@adonisjs/core'

import env from '#start/env'
import { BaseJwtContent } from '#auth/guards/jwt/types'
import JwtService from '#shared/jwt/jwt_service'

export interface JwtContent extends BaseJwtContent {}

export type GenerateAuthTokensResponse = {
  access_token: string
  refresh_token: string
}

@inject()
export default class JwtAuthTokensService {
  constructor(private jwtService: JwtService) {}

  async run(payload: JwtContent): Promise<GenerateAuthTokensResponse> {
    const accessToken = await this.generateAccessToken(payload)
    const refreshToken = await this.generateRefreshToken(payload)

    return { access_token: accessToken, refresh_token: refreshToken }
  }

  private generateAccessToken(payload: JwtContent): Promise<string> {
    return this.jwtService.sign(payload, env.get('APP_KEY'), '15m')
  }

  private generateRefreshToken(payload: JwtContent): Promise<string> {
    return this.jwtService.sign(payload, env.get('APP_KEY'), '3d')
  }
}
