import { PaginateContractType } from 'App/Shared/Interfaces/BaseInterface'

import { IRole } from 'App/Modules/Accounts/Interfaces/IRole'
import Role from 'App/Modules/Accounts/Models/Role'
import RolesRepository from 'App/Modules/Accounts/Repositories/RolesRepository'

import DTOs = IRole.DTOs

const rolesRepository = new RolesRepository()

export const listRoles = async ({
  page = 1,
  perPage = 10,
  search = '',
}: DTOs.List): Promise<PaginateContractType<typeof Role>> =>
  rolesRepository.listWithPagination({
    page,
    perPage,
    scopes: (scopes) => {
      scopes.searchQueryScope(search)
      scopes.hideRoot()
    },
  })
