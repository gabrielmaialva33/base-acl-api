import { DateTime } from 'luxon'
import { HttpContext } from '@adonisjs/core/http'

import User from '#modules/user/models/user'
import BadRequestException from '#exceptions/bad_request_exception'
import NotFoundException from '#exceptions/not_found_exception'

export default class VerifyEmailService {
  async handle(token: string): Promise<User> {
    const { i18n } = HttpContext.getOrFail()

    // Find a user by verification token
    const user = await User.query()
      .whereRaw("metadata->>'email_verification_token' = ?", [token])
      .where('is_deleted', false)
      .first()

    if (!user) {
      throw new NotFoundException(i18n.t('errors.invalid_verification_token'))
    }

    // Check if already verified
    if (user.metadata.email_verified) {
      throw new BadRequestException(i18n.t('errors.email_already_verified'))
    }

    // Check if token is expired (24 hours)
    if (user.metadata.email_verification_sent_at) {
      const sentAt = DateTime.fromISO(user.metadata.email_verification_sent_at)
      const expirationTime = sentAt.plus({ hours: 24 })
      if (DateTime.now() > expirationTime) {
        throw new BadRequestException(i18n.t('errors.verification_token_expired'))
      }
    }

    // Verify email
    user.metadata.email_verified = true
    user.metadata.email_verified_at = DateTime.now().toISO()
    user.metadata.email_verification_token = null
    user.metadata.email_verification_sent_at = null
    await user.save()

    return user
  }
}
