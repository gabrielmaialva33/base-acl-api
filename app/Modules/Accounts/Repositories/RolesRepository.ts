import BaseRepository from 'App/Shared/Repositories/BaseRepository'
import { IRole } from 'App/Modules/Accounts/Interfaces/IRole'
import Role from 'App/Modules/Accounts/Models/Role'

export default class RolesRepository
  extends BaseRepository<typeof Role>
  implements IRole.Repository
{
  constructor() {
    super(Role)
  }
}
