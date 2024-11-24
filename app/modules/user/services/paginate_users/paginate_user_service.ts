import { inject } from '@adonisjs/core'

import UsersRepository from '#modules/user/repositories/users_repository'

type PaginateUsersRequest = {
  page: number
  perPage: number
  sortBy: string
  direction: 'asc' | 'desc'
}

@inject()
export default class PaginateUserService {
  constructor(private userRepository: UsersRepository) {}

  async run(options: PaginateUsersRequest) {
    return this.userRepository.paginate(options)
  }
}
