import RolesRepository from 'App/Modules/Accounts/Repositories/RolesRepository'
import { RolesDefault } from 'App/Modules/Accounts/Defaults'

const rolesRepository = new RolesRepository()

export const storeDefaultRole = async () => {
  for (const role of RolesDefault) await rolesRepository.findOrStore({ name: role.name }, role)
}
