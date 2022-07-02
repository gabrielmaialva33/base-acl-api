import Factory from '@ioc:Adonis/Lucid/Factory'
import Role from 'App/Modules/Accounts/Models/Role'

export default Factory.define(Role, ({ faker }) => {
  const name = faker.name.jobTitle()
  return {
    slug: name,
    name: name,
    description: faker.lorem.sentence(),
    deletable: faker.helpers.arrayElement([true, false]),
    is_active: faker.helpers.arrayElement([true, false]),
  }
}).build()
