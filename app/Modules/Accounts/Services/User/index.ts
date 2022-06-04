import { DateTime } from 'luxon'

import { PaginateContractType } from 'App/Shared/Interfaces/BaseInterface'
import { IUser } from 'App/Modules/Accounts/Interfaces/IUser'
import User from 'App/Modules/Accounts/Models/User'
import UsersRepository from 'App/Modules/Accounts/Repositories/UsersRepository'
import RolesRepository from 'App/Modules/Accounts/Repositories/RolesRepository'

import NotFoundException from 'App/Shared/Exceptions/NotFoundException'

import DTOs = IUser.DTOs
import { UsersDefault } from 'App/Modules/Accounts/Defaults'

const usersRepository = new UsersRepository()
const rolesRepository = new RolesRepository()

export const listUsers = async ({
  page = 1,
  perPage = 10,
  search = '',
}: DTOs.List): Promise<PaginateContractType<typeof User>> =>
  usersRepository.listWithPagination({
    page,
    perPage,
    scopes: (scopes) => scopes.searchQueryScope(search),
  })

export const getUser = async (userId: string): Promise<User> => {
  const user = await usersRepository.findBy('id', userId)
  if (!user) throw new NotFoundException('User not found or not available.')
  return user
}

export const storeUser = async (data: DTOs.Store): Promise<User> => usersRepository.store(data)

export const editUser = async (userId: string, data: DTOs.Edit): Promise<User> => {
  const user = await usersRepository.findBy('id', userId)
  if (!user) throw new NotFoundException('User not found or not available.')
  user.merge(data)
  await usersRepository.save(user)
  return user
}

export const deleteUser = async (userId: string): Promise<void> => {
  const user = await usersRepository.findBy('id', userId)
  if (!user) throw new NotFoundException('User not found or not available.')
  user.merge({
    email: `deleted:${user.email}`,
    username: `deleted:${user.username}`,
    is_deleted: true,
    deleted_at: DateTime.now(),
  })
  await usersRepository.save(user)
}

export const storeDefaultUser = async () => {
  for (const data of UsersDefault) {
    const { roleName, ...userDto } = data
    const user = await usersRepository.findOrStore({ username: userDto.username }, userDto)
    const role = await rolesRepository.pluckBy('id', {
      like: { column: 'name', match: roleName },
    })
    await user.related('roles').attach(role)
  }
}
