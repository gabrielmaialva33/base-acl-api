import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import IRole from '#modules/role/interfaces/role_interface'

const RolesController = () => import('#modules/role/controllers/roles_controller')

router
  .group(() => {
    router.get('/', [RolesController, 'list']).as('role.list')
    router.put('/attach', [RolesController, 'attach']).as('role.attach')
  })
  .use([
    middleware.auth(),
    middleware.acl({
      role_slugs: [IRole.Slugs.ROOT, IRole.Slugs.ADMIN],
    }),
  ])
  .prefix('/api/v1/admin/roles')
