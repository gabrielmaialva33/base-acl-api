import { PaginateContractType } from 'App/Shared/Interfaces/BaseInterface'
import { IRole } from 'App/Modules/Accounts/Interfaces/IRole'
import Role from 'App/Modules/Accounts/Models/Role'
import RolesRepository from 'App/Modules/Accounts/Repositories/RolesRepository'
import NotFoundException from 'App/Shared/Exceptions/NotFoundException'

import DTOs = IRole.DTOs
import { RolesDefault } from 'App/Modules/Accounts/Defaults'

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

export const getRole = async (roleId: string) => {
  const role = await rolesRepository.findBy('id', roleId)
  if (!role) throw new NotFoundException('Role not found or not available.')
  return role
}

export const storeDefaultRole = async () => {
  for (const role of RolesDefault) await rolesRepository.findOrStore({ name: role.name }, role)
}
