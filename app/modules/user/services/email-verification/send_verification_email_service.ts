import { DateTime } from 'luxon'
import string from '@adonisjs/core/helpers/string'
import mail from '@adonisjs/mail/services/main'
import User from '#modules/user/models/user'
import VerifyEmailNotification from '#mails/verify_email_notification'

export default class SendVerificationEmailService {
  async handle(user: User): Promise<void> {
    // Generate verification token
    const token = string.generateRandom(32)

    // Initialize metadata if it doesn't exist
    if (!user.metadata) {
      user.metadata = {
        email_verified: false,
        email_verification_token: null,
        email_verification_sent_at: null,
        email_verified_at: null,
      }
    }

    // Save token and timestamp
    user.metadata.email_verification_token = token
    user.metadata.email_verification_sent_at = DateTime.now().toISO()
    await user.save()

    // Send verification email
    await mail.send(new VerifyEmailNotification(user, token))
  }
}
