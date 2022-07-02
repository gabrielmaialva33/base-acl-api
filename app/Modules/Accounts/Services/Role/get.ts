import RolesRepository from 'App/Modules/Accounts/Repositories/RolesRepository'
import NotFoundException from 'App/Shared/Exceptions/NotFoundException'

const rolesRepository = new RolesRepository()

export const getRoleById = async (roleId: string) => {
  const role = await rolesRepository.findBy('id', roleId)
  if (!role) throw new NotFoundException('Role not found or not available.')
  return role
}

export const getRoleByName = async (roleName: string) => {
  const role = await rolesRepository.findBy('name', roleName)
  if (!role) throw new NotFoundException('Role not found or not available.')
  return role
}
