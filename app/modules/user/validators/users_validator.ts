import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    full_name: vine.string().trim(),
    email: vine
      .string()
      .email()
      .trim()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    username: vine
      .string()
      .trim()
      .unique(async (db, value) => {
        const user = await db.from('users').where('username', value).first()
        return !user
      })
      .optional(),
    password: vine.string().confirmed({ confirmationField: 'password_confirmation' }).trim(),
  })
)

export const editUserValidator = vine.withMetaData<{ userId: number }>().compile(
  vine.object({
    full_name: vine.string().trim().optional(),
    email: vine
      .string()
      .trim()
      .unique(async (db, value, field) => {
        const user = await db
          .from('users')
          .whereNot('id', field.meta.userId)
          .where('email', value)
          .first()
        return !user
      })
      .optional(),
    username: vine
      .string()
      .trim()
      .unique(async (db, value, field) => {
        const user = await db
          .from('users')
          .whereNot('id', field.meta.userId)
          .where('username', value)
          .first()
        return !user
      })
      .optional(),
    password: vine
      .string()
      .trim()
      .confirmed({ confirmationField: 'password_confirmation' })
      .optional()
      .requiredIfAnyExists(['password']),
  })
)