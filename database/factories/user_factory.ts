import factory from '@adonisjs/lucid/factories'
import User from '#modules/user/models/user'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      full_name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      is_deleted: faker.datatype.boolean(),
    }
  })
  .build()
