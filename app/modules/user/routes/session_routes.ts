import router from '@adonisjs/core/services/router'
import { authThrottle } from '#start/limiter'

const SessionsController = () => import('#modules/user/controllers/sessions_controller')

router
  .group(() => {
    router.post('/sign-in', [SessionsController, 'signIn']).as('session.signIn').use(authThrottle)

    router.post('/sign-up', [SessionsController, 'signUp']).as('session.signUp').use(authThrottle)
  })
  .prefix('/api/v1/sessions')
