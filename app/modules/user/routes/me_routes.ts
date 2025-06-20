import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const MeController = () => import('#modules/user/controllers/me_controller')

router
  .group(() => {
    router.get('/', [MeController, 'profile']).as('me.profile')
    router.get('/permissions', [MeController, 'permissions']).as('me.permissions')
    router.get('/roles', [MeController, 'roles']).as('me.roles')
  })
  .prefix('/api/v1/me')
  .use(middleware.auth())
  .as('me')
