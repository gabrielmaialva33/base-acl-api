import { IUser } from 'App/Modules/Accounts/Interfaces/IUser'
import User from 'App/Modules/Accounts/Models/User'
import UsersRepository from 'App/Modules/Accounts/Repositories/UsersRepository'

import NotFoundException from 'App/Shared/Exceptions/NotFoundException'
import BadRequestException from 'App/Shared/Exceptions/BadRequestException'

import DTOs = IUser.DTOs

const usersRepository = new UsersRepository()

export const editUser = async (userId: string, data: DTOs.Edit): Promise<User> => {
  const user = await usersRepository.findBy('id', userId)
  if (!user) throw new NotFoundException('User not found or not available.')
  if (user.isRole('root')) throw new BadRequestException('Can not edit this user.')

  const { roles, ...userDto } = data

  user.merge(userDto)
  await usersRepository.save(user)
  if (roles && roles.length > 0) user.related('roles').sync(roles)

  return user.refresh()
}
