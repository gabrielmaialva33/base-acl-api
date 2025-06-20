import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

import { createUserValidator, signInValidator } from '#modules/user/validators/users_validator'

import SignInService from '#modules/user/services/sign-in/sign_in_service'
import SignUpService from '#modules/user/services/sign-up/sign_up_service'

export default class SessionsController {
  async signIn(ctx: HttpContext) {
    const { request, response } = ctx
    const { uid, password } = await request.validateUsing(signInValidator)

    try {
      const service = await app.container.make(SignInService)
      const payload = await service.run({ uid, password, ctx })
      return response.json(payload)
    } catch (error) {
      return response.badRequest({
        errors: [
          {
            message: error.message,
          },
        ],
      })
    }
  }

  async signUp({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)

    const service = await app.container.make(SignUpService)
    const userWithAuth = await service.run(payload)

    return response.created(userWithAuth)
  }
}
