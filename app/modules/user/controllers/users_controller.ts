import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

import PaginateUserService from '#modules/user/services/paginate-users/paginate_user_service'
import GetUserService from '#modules/user/services/get-user/get_user_service'
import CreateUserService from '#modules/user/services/create-user/create_user_service'
import EditUserService from '#modules/user/services/edit-user/edit_user_service'
import DeleteUserService from '#modules/user/services/delete-user/delete_user_service'

import { createUserValidator, editUserValidator } from '#modules/user/validators/users_validator'

@inject()
export default class UsersController {
  async paginate({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const sortBy = request.input('sort_by', undefined)
    const direction = request.input('direction', undefined)

    const service = await app.container.make(PaginateUserService)
    const users = await service.run({
      page,
      perPage,
      sortBy,
      direction,
    })

    return response.json(users)
  }

  async get({ params, response }: HttpContext) {
    const userId = +params.id

    const service = await app.container.make(GetUserService)

    const user = await service.run(userId)
    return response.json(user)
  }

  async create({ request, response }: HttpContext) {
    const payload = await createUserValidator.validate(request.all())

    const service = await app.container.make(CreateUserService)

    const user = await service.run(payload)
    return response.json(user)
  }

  async update({ params, request, response }: HttpContext) {
    const userId = +params.id
    const payload = await editUserValidator.validate(request.all(), { meta: { userId } })

    const service = await app.container.make(EditUserService)

    const user = await service.run(userId, payload)
    return response.json(user)
  }

  async delete({ params, response, i18n }: HttpContext) {
    const userId = +params.id

    const service = await app.container.make(DeleteUserService)
    await service.run(userId)

    return response.json({
      success: true,
      message: i18n.t('messages.deleted', { resource: i18n.t('models.user') }),
    })
  }
}
