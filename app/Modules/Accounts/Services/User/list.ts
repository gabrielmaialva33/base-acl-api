import { PaginateContractType } from 'App/Shared/Interfaces/BaseInterface'

import { IUser } from 'App/Modules/Accounts/Interfaces/IUser'
import User from 'App/Modules/Accounts/Models/User'
import UsersRepository from 'App/Modules/Accounts/Repositories/UsersRepository'

const usersRepository = new UsersRepository()

import DTOs = IUser.DTOs

export const listUsers = async ({
  page = 1,
  perPage = 10,
  search = '',
}: DTOs.List): Promise<PaginateContractType<typeof User>> =>
  usersRepository.listWithPagination({
    page,
    perPage,
    scopes: (scopes) => {
      scopes.searchQueryScope(search)
      scopes.hideRoot()
    },
  })
