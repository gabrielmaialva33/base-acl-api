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
    const perPage = request.input('perPage', 10) || request.input('per_page', 10)
    const sortBy = request.input('sortBy', 'id') || request.input('sort_by', 'id')
    const direction = request.input('order', 'asc') || request.input('direction', 'asc')
    const search = request.input('search', undefined)

    const service = await app.container.make(PaginateUserService)
    const users = await service.run({
      page,
      perPage,
      sortBy,
      direction,
      search,
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
    const data = request.all()
    // Map camelCase to snake_case for validator
    const mappedData = {
      full_name: data.full_name || data.full_name,
      email: data.email,
      username: data.username,
      password: data.password,
      password_confirmation: data.password_confirmation || data.passwordConfirmation,
    }

    const payload = await createUserValidator.validate(mappedData)

    const service = await app.container.make(CreateUserService)

    const user = await service.run(payload)
    return response.created(user)
  }

  async update({ params, request, response }: HttpContext) {
    const userId = +params.id
    const data = request.all()
    // Map camelCase to snake_case for validator
    const mappedData = {
      full_name: data.full_name || data.full_name,
      email: data.email,
      username: data.username,
      password: data.password,
      password_confirmation: data.password_confirmation || data.passwordConfirmation,
    }

    const payload = await editUserValidator.validate(mappedData, { meta: { userId } })

    const service = await app.container.make(EditUserService)

    const user = await service.run(userId, payload)
    return response.json(user)
  }

  async delete({ params, response }: HttpContext) {
    const userId = +params.id

    const service = await app.container.make(DeleteUserService)
    await service.run(userId)

    return response.noContent()
  }
}
