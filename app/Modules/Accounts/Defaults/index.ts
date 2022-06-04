import { ModelType } from 'App/Shared/Interfaces/BaseInterface'
import User from 'App/Modules/Accounts/Models/User'
import Role from 'App/Modules/Accounts/Models/Role'

type UserDefaultType = ModelType<typeof User> & { roleName: string }

export const RolesDefault: Array<ModelType<typeof Role>> = [
  {
    slug: 'Root',
    name: 'root',
    description: 'a root user system',
    is_active: true,
    deletable: false,
  },
  {
    slug: 'Admin',
    name: 'admin',
    description: 'a admin user system',
    is_active: true,
    deletable: false,
  },
  {
    slug: 'User',
    name: 'user',
    description: 'a common user system',
    is_active: true,
    deletable: false,
  },
  {
    slug: 'Guest',
    name: 'guest',
    description: 'a common guest user system',
    is_active: true,
    deletable: false,
  },
]

export const UsersDefault: Array<UserDefaultType> = [
  {
    first_name: 'Root',
    last_name: 'User',
    username: 'root',
    email: 'root@acl.com',
    password: 'acl@2022',
    roleName: 'root',
  },
  {
    first_name: 'Admin',
    last_name: 'User',
    username: 'admin',
    email: 'admin@acl.com',
    password: 'acl@2022',
    roleName: 'admin',
  },
  {
    first_name: 'Gabriel',
    last_name: 'Maia',
    username: 'maia',
    email: 'gabriel.maia@acl.com',
    password: 'acl@2022',
    roleName: 'user',
  },
]
