import { BaseSeeder } from '@adonisjs/lucid/seeders'

import User from '#modules/user/models/user'
import { UserFactory } from '#database/factories/user_factory'

export default class extends BaseSeeder {
  async run() {
    const users = await UserFactory.merge({
      password: '123456',
    }).createMany(20)
    await User.createMany(users)
  }
}
