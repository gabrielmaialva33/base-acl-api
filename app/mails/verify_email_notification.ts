import { BaseMail } from '@adonisjs/mail'
import User from '#modules/user/models/user'
import env from '#start/env'

export default class VerifyEmailNotification extends BaseMail {
  subject = 'Verify your email address'

  constructor(
    private user: User,
    private token: string
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    const verificationUrl = `${env.get('APP_URL', 'http://localhost:3333')}/api/v1/verify-email?token=${this.token}`

    this.message.to(this.user.email, this.user.full_name)
    this.message.htmlView('emails/verify_email_html', {
      user: this.user,
      verificationUrl,
    })
    this.message.textView('emails/verify_email_text', {
      user: this.user,
      verificationUrl,
    })
  }
}
