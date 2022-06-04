import { DateTime } from 'luxon'

import { PaginateContractType } from 'App/Shared/Interfaces/BaseInterface'
import { IUser } from 'App/Modules/Accounts/Interfaces/IUser'
import User from 'App/Modules/Accounts/Models/User'
import UsersRepository from 'App/Modules/Accounts/Repositories/UsersRepository'

import NotFoundException from 'App/Shared/Exceptions/NotFoundException'

import DTOs = IUser.DTOs

const usersRepository = new UsersRepository()

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
