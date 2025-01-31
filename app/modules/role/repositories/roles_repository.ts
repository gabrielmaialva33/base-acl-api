import LucidRepository from '#shared/lucid/lucid_repository'
import Role from '#modules/role/models/role'
import IRole from '#modules/role/interfaces/role_interface'

export default class RolesRepository
  extends LucidRepository<typeof Role>
  implements IRole.Repository
{
  constructor() {
    super(Role)
  }

  isAdmin(roles: Role[]): boolean {
    const { ROOT, ADMIN } = IRole.Slugs

    return roles.some((role) => [ROOT, ADMIN].includes(role.slug))
  }
}
