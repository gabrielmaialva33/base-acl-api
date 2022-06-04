import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import AuthorizationException from 'App/Shared/Exceptions/AuthorizationException'

export default class Acl {
  public async handle(
    { auth }: HttpContextContract,
    next: () => Promise<void>,
    allowedRoles: Array<string>
  ) {
    if (Array.isArray(allowedRoles) === false) throw new AuthorizationException('User not allowed.')

    const user = await auth.authenticate()
    await user.load('roles')
    const roles = user.roles.map((role) => role.name)
    for (const roleName of allowedRoles) if (roles.includes(roleName)) return next()

    throw new AuthorizationException('User not allowed.')
  }
}
