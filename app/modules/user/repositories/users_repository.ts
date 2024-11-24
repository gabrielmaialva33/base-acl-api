import LucidRepository from '../../../shared/lucid/lucid_repository'
import User from '#modules/user/models/user'

import IUser from '#modules/user/interfaces/user_interface'

export default class UsersRepository
  extends LucidRepository<typeof User>
  implements IUser.Repository
{
  constructor() {
    super(User)
  }

  async verifyCredentials(uid: string, password: string): Promise<User> {
    return this.model.verifyCredentials(uid, password)
  }
}
