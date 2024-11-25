import router from '@adonisjs/core/services/router'

const SessionsController = () => import('#modules/user/controllers/sessions_controller')

router
  .group(() => {
    router.post('/sign-in', [SessionsController, 'signIn']).as('session.signIn')
    router.post('/sign-up', [SessionsController, 'signUp']).as('session.signUp')
  })
  .prefix('sessions')
