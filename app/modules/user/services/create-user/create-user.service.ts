import { inject } from '@adonisjs/core'
import UsersRepository from '#modules/user/repositories/users_repository'
import IUser from '#modules/user/interfaces/user_interface'

@inject()
export default class CreateUserService {
  constructor(private userRepository: UsersRepository) {}

  async run(payload: IUser.CreatePayload) {
    return this.userRepository.create(payload)
  }
}
