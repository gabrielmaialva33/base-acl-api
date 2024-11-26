import vine from '@vinejs/vine'

export const attachRoleValidator = vine.compile(
  vine.object({
    user_id: vine.number(),
    role_ids: vine.array(
      vine.number().exists(async (db, value) => {
        const roles = await db.from('roles').where('id', +value)
        return roles.length === value.length
      })
    ),
  })
)
