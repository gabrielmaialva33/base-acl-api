import factory from '@adonisjs/lucid/factories'
import User from '#modules/user/models/user'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      fullName: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      isDeleted: faker.datatype.boolean(),
    }
  })
  .build()
