import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { LoginSchema } from 'App/Modules/Accounts/Validators/User'
import AuthorizationException from 'App/Shared/Exceptions/AuthorizationException'

export default class AuthController {
  public async store({ request, auth, response }: HttpContextContract): Promise<void> {
    const { uid, password } = await request.validate({ schema: LoginSchema })

    try {
      const token = await auth
        .use('api')
        .attempt(uid, password, { name: 'acl-token', expiresIn: '1h' })

      return response.json(token)
    } catch (error) {
      throw new AuthorizationException(
        'Unable to login, please check your credentials or try again later.'
      )
    }
  }
}
