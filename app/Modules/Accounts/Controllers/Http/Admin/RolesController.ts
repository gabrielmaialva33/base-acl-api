import { container } from 'tsyringe'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { RoleServices } from 'App/Modules/Accounts/Services/Admin'

export default class RolesController {
  public async list({ request, response }: HttpContextContract): Promise<void> {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const search = request.input('search', '')

    const roleServices = container.resolve(RoleServices)
    const roles = await roleServices.list({ page, perPage, search })

    return response.json(roles)
  }

  public async get({ params, response }: HttpContextContract): Promise<void> {
    const { id: roleId } = params

    const roleServices = container.resolve(RoleServices)
    const role = await roleServices.getById(roleId)

    return response.json(role)
  }
}
