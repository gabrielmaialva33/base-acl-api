import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import IRole from '#modules/role/interfaces/role_interface'

const UsersController = () => import('#modules/user/controllers/users_controller')

router
  .group(() => {
    router.get('/', [UsersController, 'paginate']).as('user.paginate')
    router
      .get('/:id', [UsersController, 'get'])
      .where('id', /^[0-9]+$/)
      .as('user.get')
    router.post('/', [UsersController, 'create']).as('user.create')
    router
      .put('/:id', [UsersController, 'update'])
      .where('id', /^[0-9]+$/)
      .as('user.update')
    router.delete('/:id', [UsersController, 'delete']).as('user.delete')
  })
  .use([
    middleware.auth(),
    middleware.acl({
      role_slugs: [IRole.Slugs.USER],
    }),
  ])
  .prefix('/api/v1/users')
