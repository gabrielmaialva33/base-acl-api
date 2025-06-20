import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import JwtAuthTokensService from '#modules/user/services/jwt/jwt_auth_tokens_service'
import UsersRepository from '#modules/user/repositories/users_repository'
import RolesRepository from '#modules/role/repositories/roles_repository'
import NotFoundException from '#exceptions/not_found_exception'
import AuthEventService from '#modules/user/services/auth_event_service'

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
    const ctx = HttpContext.getOrFail()
    const { i18n } = ctx

    // Emit login attempted event
    AuthEventService.emitLoginAttempted(uid, ctx)

    try {
      const user = await this.usersRepository.verifyCredentials(uid, password)

      await user.load('roles')

      const isAdmin = this.rolesRepository.isAdmin(user.roles)

      if (!isAdmin) {
        // Emit login failed event for non-admin attempting admin login
        AuthEventService.emitLoginFailed(uid, 'Not an admin user', ctx)
        throw new NotFoundException(i18n.t('errors.permission_denied'))
      }

      const auth = await this.jwtAuthTokensService.run({ userId: user.id })
      const userJson = user.toJSON()

      // Emit login succeeded event
      AuthEventService.emitLoginSucceeded(user, 'password', true, ctx)

      return { ...userJson, auth }
    } catch (error) {
      // Emit login failed event if not already emitted
      if (error.message !== i18n.t('errors.permission_denied')) {
        AuthEventService.emitLoginFailed(uid, error.message || 'Invalid credentials', ctx)
      }
      throw error
    }
  }
}
