import { container, delay } from 'tsyringe'

import { IRole } from 'App/Modules/Accounts/Interfaces/IRole'
import RolesRepository from 'App/Modules/Accounts/Repositories/RolesRepository'

import { IUser } from 'App/Modules/Accounts/Interfaces/IUser'
import UsersRepository from 'App/Modules/Accounts/Repositories/UsersRepository'

container.registerSingleton<IRole.Repository>(
  'RolesRepository',
  delay(() => RolesRepository)
)

container.registerSingleton<IUser.Repository>(
  'UsersRepository',
  delay(() => UsersRepository)
)
