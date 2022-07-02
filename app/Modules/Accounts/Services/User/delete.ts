import { DateTime } from 'luxon'

import UsersRepository from 'App/Modules/Accounts/Repositories/UsersRepository'

import BadRequestException from 'App/Shared/Exceptions/BadRequestException'
import NotFoundException from 'App/Shared/Exceptions/NotFoundException'

const usersRepository = new UsersRepository()

export const deleteUser = async (userId: string): Promise<void> => {
  const user = await usersRepository.findBy('id', userId)
  if (!user) throw new NotFoundException('User not found or not available.')
  if (user.isRole('root')) throw new BadRequestException('Can not edit this user.')

  user.merge({
    email: `deleted:${user.email}`,
    username: `deleted:${user.username}`,
    is_deleted: true,
    deleted_at: DateTime.now(),
  })
  await usersRepository.save(user)
}
