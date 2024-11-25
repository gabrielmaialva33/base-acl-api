import { inject } from '@adonisjs/core'
import UsersRepository from '#modules/user/repositories/users_repository'
import GenerateAuthTokensService from '#modules/user/services/auth_tokens/generate_auth_tokens_service'

type SignInRequest = {
  uid: string
  password: string
}

@inject()
export default class SignInService {
  constructor(
    private usersRepository: UsersRepository,
    private generateAuthTokensService: GenerateAuthTokensService
  ) {}

  async run({ uid, password }: SignInRequest) {
    const user = await this.usersRepository.verifyCredentials(uid, password)

    const payload = await this.generateAuthTokensService.run(user.id)

    return { ...user.toJSON(), auth: payload }
  }
}
