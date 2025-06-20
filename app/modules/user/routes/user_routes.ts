import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiThrottle } from '#start/limiter'
import IPermission from '#modules/permission/interfaces/permission_interface'

const UsersController = () => import('#modules/user/controllers/users_controller')

router
  .group(() => {
    router
      .get('/', [UsersController, 'paginate'])
      .use(
        middleware.permission({
          permissions: `${IPermission.Resources.USERS}.${IPermission.Actions.LIST}`,
        })
      )
      .as('user.paginate')

    router
      .get('/:id', [UsersController, 'get'])
      .where('id', /^[0-9]+$/)
      .use(
        middleware.permission({
          permissions: `${IPermission.Resources.USERS}.${IPermission.Actions.READ}`,
        })
      )
      .as('user.get')

    router
      .post('/', [UsersController, 'create'])
      .use(
        middleware.permission({
          permissions: `${IPermission.Resources.USERS}.${IPermission.Actions.CREATE}`,
        })
      )
      .as('user.create')

    router
      .put('/:id', [UsersController, 'update'])
      .where('id', /^[0-9]+$/)
      .use(
        middleware.permission({
          permissions: `${IPermission.Resources.USERS}.${IPermission.Actions.UPDATE}`,
        })
      )
      .as('user.update')

    router
      .delete('/:id', [UsersController, 'delete'])
      .use(
        middleware.permission({
          permissions: `${IPermission.Resources.USERS}.${IPermission.Actions.DELETE}`,
        })
      )
      .as('user.delete')
  })
  .use([middleware.auth(), apiThrottle])
  .prefix('/api/v1/users')
