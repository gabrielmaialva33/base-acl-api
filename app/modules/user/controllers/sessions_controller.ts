import { HttpContext } from '@adonisjs/core/http'
import SignInService from '#modules/user/services/sessions/sign_in_service'

import { createUserValidator, signInValidator } from '#modules/user/validators/users_validator'
import app from '@adonisjs/core/services/app'
import SignUpService from '#modules/user/services/sessions/sign_up_service'

export default class SessionsController {
  async signIn({ request, response }: HttpContext) {
    const { uid, password } = await request.validateUsing(signInValidator)

    const service = await app.container.make(SignInService)
    const payload = await service.run({ uid, password })

    return response.json(payload)
  }

  async signUp({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)

    const service = await app.container.make(SignUpService)
    const userWithAuth = await service.run(payload)

    return response.json(userWithAuth)
  }
}
