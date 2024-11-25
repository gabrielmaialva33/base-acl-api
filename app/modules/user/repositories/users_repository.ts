import User from '#modules/user/models/user'

import IUser from '#modules/user/interfaces/user_interface'
import LucidRepository from '#shared/lucid/lucid_repository'
import { AccessToken } from '@adonisjs/auth/access_tokens'

export default class UsersRepository
  extends LucidRepository<typeof User>
  implements IUser.Repository
{
  constructor() {
    super(User)
  }

  async verifyCredentials(uid: string, password: string): Promise<User> {
    return this.model.verifyCredentials(uid, password)
  }

  async generateAccessToken(userId: number, abilities?: string[]): Promise<AccessToken> {
    const user = await this.model.findByOrFail({ id: userId })
    return this.model.accessTokens.create(user, abilities, {
      name: `access_token:${user.id}:${user.email}`,
    })
  }

  async generateRefreshToken(userId: number, abilities?: string[]): Promise<AccessToken> {
    const user = await this.model.findByOrFail({ id: userId })
    return this.model.refreshTokens.create(user, abilities, {
      name: `refresh_token:${user.id}:${user.email}`,
    })
  }
}
