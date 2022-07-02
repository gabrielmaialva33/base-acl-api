import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { getRoleById, listRoles } from 'App/Modules/Accounts/Services/Role'

export default class RolesController {
  public async list({ request, response }: HttpContextContract): Promise<void> {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const search = request.input('search', '')

    const roles = await listRoles({ page, perPage, search })

    return response.json(roles)
  }

  public async get({ params, response }: HttpContextContract): Promise<void> {
    const { id: roleId } = params

    const role = await getRoleById(roleId)

    return response.json(role)
  }
}
