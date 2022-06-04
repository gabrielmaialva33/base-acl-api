import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RolesController {
  public async list({}: HttpContextContract): Promise<void> {}

  public async get({}: HttpContextContract): Promise<void> {}

  public async store({}: HttpContextContract): Promise<void> {}

  public async edit({}: HttpContextContract): Promise<void> {}

  public async delete({}: HttpContextContract): Promise<void> {}
}
