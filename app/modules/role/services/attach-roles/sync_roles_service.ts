import { inject } from '@adonisjs/core'
import app from '@adonisjs/core/services/app'
import GetUserService from '#modules/user/services/get-user/get_user_service'

type SyncRolesRequest = {
  userId: number
  roleIds: number[]
}

@inject()
export default class SyncRolesService {
  constructor() {}

  async run({ userId, roleIds }: SyncRolesRequest) {
    const getUserService = await app.container.make(GetUserService)
    const user = await getUserService.run(userId)

    await user.related('roles').sync(roleIds)
  }
}
