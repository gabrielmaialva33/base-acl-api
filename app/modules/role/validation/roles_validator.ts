import vine from '@vinejs/vine'

export const attachRoleValidator = vine.compile(
  vine.object({
    user_id: vine.number(),
    role_ids: vine.array(vine.number()),
  })
)
