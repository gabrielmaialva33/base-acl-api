import { HttpContext } from '@adonisjs/core/http'

import { createUserValidator, signInValidator } from '#modules/user/validators/users_validator'
import app from '@adonisjs/core/services/app'

import SignInService from '#modules/user/services/sign-in/sign-in.service'
import SignUpService from '#modules/user/services/sign-up/sign-up.service'

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
