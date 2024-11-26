import vine from '@vinejs/vine'

export const attachRoleValidator = vine.compile(
  vine.object({
    user_id: vine.number().exists(async (db, value) => {
      const users = await db.from('users').where('id', value)
      return users.length === 1
    }),
    role_ids: vine.array(
      vine.number().exists(async (db, value) => {
        const roles = await db.from('roles').where('id', value)
        return roles.length === 1
      })
    ),
  })
)
