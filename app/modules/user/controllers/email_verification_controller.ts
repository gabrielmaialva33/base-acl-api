import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

import VerifyEmailService from '#modules/user/services/email-verification/verify_email_service'
import SendVerificationEmailService from '#modules/user/services/email-verification/send_verification_email_service'

@inject()
export default class EmailVerificationController {
  constructor(
    private verifyEmailService: VerifyEmailService,
    private sendVerificationEmailService: SendVerificationEmailService
  ) {}

  /**
   * Verify email with a token
   */
  async verify({ request, response }: HttpContext) {
    const schema = vine.compile(
      vine.object({
        token: vine.string().trim(),
      })
    )

    const { token } = await request.validateUsing(schema)

    const user = await this.verifyEmailService.handle(token)

    return response.ok({
      message: 'Email verified successfully',
      email_verified: user.metadata.email_verified,
      email_verified_at: user.metadata.email_verified_at,
    })
  }

  /**
   * Resend verification email
   */
  async resend({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    if (user.metadata.email_verified) {
      return response.badRequest({
        message: 'Email already verified',
      })
    }

    await this.sendVerificationEmailService.handle(user)

    return response.ok({
      message: 'Verification email sent successfully',
    })
  }
}
