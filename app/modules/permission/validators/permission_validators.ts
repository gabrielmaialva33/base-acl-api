import vine from '@vinejs/vine'
import IPermission from '#modules/permission/interfaces/permission_interface'

/**
 * Validator for creating a permission
 */
export const createPermissionValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    description: vine.string().optional(),
    resource: vine.enum(Object.values(IPermission.Resources)),
    action: vine.enum(Object.values(IPermission.Actions)),
  })
)

/**
 * Validator for syncing role permissions
 */
export const syncRolePermissionsValidator = vine.compile(
  vine.object({
    role_id: vine.number().positive(),
    permission_ids: vine.array(vine.number().positive()),
  })
)

/**
 * Validator for syncing user permissions
 */
export const syncUserPermissionsValidator = vine.compile(
  vine.object({
    user_id: vine.number().positive(),
    permissions: vine.array(
      vine.object({
        permission_id: vine.number().positive(),
        granted: vine.boolean().optional(),
        expires_at: vine.string().optional().nullable(),
      })
    ),
  })
)
