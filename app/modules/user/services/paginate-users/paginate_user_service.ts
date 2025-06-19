import { inject } from '@adonisjs/core'

import UsersRepository from '#modules/user/repositories/users_repository'

type PaginateUsersRequest = {
  page: number
  perPage: number
  sortBy: string
  direction: 'asc' | 'desc'
  search?: string
}

@inject()
export default class PaginateUserService {
  constructor(private userRepository: UsersRepository) {}

  async run(options: PaginateUsersRequest) {
    const { search, ...paginateOptions } = options

    const queryOptions = {
      ...paginateOptions,
      modifyQuery: search
        ? (query: any) => {
            query.where((builder: any) => {
              builder
                .where('email', 'ilike', `%${search}%`)
                .orWhere('username', 'ilike', `%${search}%`)
                .orWhere('full_name', 'ilike', `%${search}%`)
            })
          }
        : undefined,
      scopes: (scopes: any) => scopes.includeRoles(),
    }

    return this.userRepository.paginate(queryOptions)
  }
}
