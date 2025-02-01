import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import JwtAuthTokensService from '#modules/user/services/jwt/jwt_auth_tokens_service'
import UsersRepository from '#modules/user/repositories/users_repository'
import RolesRepository from '#modules/role/repositories/roles_repository'
import NotFoundException from '#exceptions/not_found_exception'

type SignInRequest = {
  uid: string
  password: string
}

@inject()
export default class AdminSignInService {
  constructor(
    private usersRepository: UsersRepository,
    private rolesRepository: RolesRepository,
    private jwtAuthTokensService: JwtAuthTokensService
  ) {}

  async run({ uid, password }: SignInRequest) {
    const { i18n } = HttpContext.getOrFail()

    const user = await this.usersRepository.verifyCredentials(uid, password)

    await user.load('roles')

    const isAdmin = this.rolesRepository.isAdmin(user.roles)

    if (!isAdmin) throw new NotFoundException(i18n.t('errors.permission_denied'))

    const auth = await this.jwtAuthTokensService.run({ userId: user.id })
    const userJson = user.toJSON()

    return { ...userJson, auth }
  }
}
