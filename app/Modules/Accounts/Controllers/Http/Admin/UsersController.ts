import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import {
  listUsers,
  getUser,
  storeUser,
  editUser,
  deleteUser,
} from 'App/Modules/Accounts/Services/User'
import { EditUserSchema, StoreUserSchema } from 'App/Modules/Accounts/Validators/User'

export default class UsersController {
  public async list({ request, response }: HttpContextContract): Promise<void> {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const search = request.input('search', '')
    const users = await listUsers({ page, perPage, search })
    return response.json(users)
  }

  public async get({ params, response }: HttpContextContract): Promise<void> {
    const { id: userId } = params
    const user = await getUser(userId)
    return response.json(user)
  }

  public async store({ request, response }: HttpContextContract): Promise<void> {
    const userDto = await request.validate({ schema: StoreUserSchema })
    const user = await storeUser(userDto)
    return response.json(user)
  }

  public async edit({ request, params, response }: HttpContextContract): Promise<void> {
    const { id: userId } = params
    const userDto = await request.validate({ schema: EditUserSchema })
    const user = await editUser(userId, userDto)
    return response.json(user)
  }

  public async delete({ params, response }: HttpContextContract): Promise<void> {
    const { id: userId } = params
    await deleteUser(userId)
    return response.json({ message: 'User deleted successfully.' })
  }
}
