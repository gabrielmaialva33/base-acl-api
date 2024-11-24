import { LucidRepositoryInterface } from '../../../shared/lucid/lucid_repository_interface'
import User from '#modules/user/models/user'

namespace IUser {
  export interface Repository extends LucidRepositoryInterface<typeof User> {
    verifyCredentials(uid: string, password: string): Promise<User>
  }

  export interface CreatePayload {
    full_name: string
    email: string
    username?: string
    password: string
  }

  export interface EditPayload {
    full_name?: string
    email?: string
    username?: string
    password?: string
  }
}

export default IUser
