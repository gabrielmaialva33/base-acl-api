import { container } from 'tsyringe'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { UserServices } from 'App/Modules/Accounts/Services/User'
import {
  EditUserWithAdminSchema,
  StoreUserWithAdminSchema,
} from 'App/Modules/Accounts/Validators/User'

export default class UsersController {
  public async list({ request, response }: HttpContextContract): Promise<void> {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const search = request.input('search', '')

    const userServices = container.resolve(UserServices)
    const users = await userServices.list({ page, perPage, search })
    return response.json(users)
  }

  public async get({ params, response }: HttpContextContract): Promise<void> {
    const { id: userId } = params

    const userServices = container.resolve(UserServices)
    const user = await userServices.get(userId)
    return response.json(user)
  }

  public async store({ request, response }: HttpContextContract): Promise<void> {
    const userDto = await request.validate({ schema: StoreUserWithAdminSchema })
    const userServices = container.resolve(UserServices)
    const user = await userServices.store(userDto)
    return response.json(user)
  }

  public async edit({ request, params, response }: HttpContextContract): Promise<void> {
    const { id: userId } = params
    const userDto = await request.validate({ schema: EditUserWithAdminSchema })
    const userServices = container.resolve(UserServices)
    const user = await userServices.edit(userId, userDto)
    return response.json(user)
  }

  public async delete({ params, response }: HttpContextContract): Promise<void> {
    const { id: userId } = params
    const userServices = container.resolve(UserServices)
    await userServices.delete(userId)
    return response.json({ message: 'User deleted successfully.' })
  }
}
