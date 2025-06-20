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

    // Set the sender of the email
    this.message.from(
      env.get('SMTP_FROM_ADDRESS', 'noreply@example.com'),
      env.get('SMTP_FROM_NAME', 'ACL API')
    )

    // Set the recipient of the email
    this.message.to(this.user.email, this.user.full_name)

    // For testing environments or when Edge is not available, use plain text/html
    if (env.get('NODE_ENV') === 'test') {
      this.message.html(`
        <h1>Welcome ${this.user.full_name}!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationUrl}">Verify Email</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${verificationUrl}</p>
      `)
      this.message.text(`
        Welcome ${this.user.full_name}!

        Please verify your email address by visiting the following URL:
        ${verificationUrl}
      `)
    } else {
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
}
