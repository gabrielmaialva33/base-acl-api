import User from 'App/Modules/Accounts/Models/User'
import UsersRepository from 'App/Modules/Accounts/Repositories/UsersRepository'

import NotFoundException from 'App/Shared/Exceptions/NotFoundException'

const usersRepository = new UsersRepository()

export const getUser = async (userId: string): Promise<User> => {
  const user = await usersRepository.findBy('id', userId)
  if (!user) throw new NotFoundException('User not found or not available.')
  return user
}
