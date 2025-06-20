import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const EmailVerificationController = () =>
  import('#modules/user/controllers/email_verification_controller')

router
  .group(() => {
    // Public route - verify email with token
    router.get('/verify-email', [EmailVerificationController, 'verify'])

    // Authenticated route - resend verification email
    router
      .post('/resend-verification-email', [EmailVerificationController, 'resend'])
      .use(middleware.auth({ guards: ['jwt'] }))
  })
  .prefix('/api/v1')
