import { IUser } from 'App/Modules/Accounts/Interfaces/IUser'
import User from 'App/Modules/Accounts/Models/User'
import UsersRepository from 'App/Modules/Accounts/Repositories/UsersRepository'
import RolesRepository from 'App/Modules/Accounts/Repositories/RolesRepository'

import { UsersDefault } from 'App/Modules/Accounts/Defaults'

import DTOs = IUser.DTOs

const usersRepository = new UsersRepository()
const rolesRepository = new RolesRepository()

export const storeUser = async (data: DTOs.Store): Promise<User> => {
  const { roles, ...userDto } = data

  const user = await usersRepository.store(userDto)
  if (roles && roles.length > 0) user.related('roles').attach(roles)

  return user.refresh()
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
