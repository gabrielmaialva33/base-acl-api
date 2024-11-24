import LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'
import Role from '#modules/role/models/role'

namespace IRole {
  export interface Repository extends LucidRepositoryInterface<typeof Role> {}

  export enum Slugs {
    ROOT = 'root',
    ADMIN = 'admin',
    USER = 'user',
    GUEST = 'guest',
  }
}

export default IRole
