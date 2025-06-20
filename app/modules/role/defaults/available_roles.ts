import IRole from '#modules/role/interfaces/role_interface'
import Role from '#modules/role/models/role'
import { ModelAttributes } from '@adonisjs/lucid/types/model'

export default [
  { name: 'Root', slug: IRole.Slugs.ROOT },
  { name: 'Admin', slug: IRole.Slugs.ADMIN },
  { name: 'User', slug: IRole.Slugs.USER },
  { name: 'Guest', slug: IRole.Slugs.GUEST },
  { name: 'Editor', slug: IRole.Slugs.EDITOR },
] as ModelAttributes<Role>[]
