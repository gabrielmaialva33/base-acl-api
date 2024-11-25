import { GuardConfigProvider } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import { Secret } from '@adonisjs/core/helpers'

import { JwtGuardUser, JwtUserProviderContract } from '#auth/guards/jwt/types'
import { JwtGuard } from '#auth/guards/jwt/jwt'

export function jwtGuard<UserProvider extends JwtUserProviderContract<unknown>>(config: {
  provider: UserProvider
  tokenExpiresIn?: number | string
  useCookies?: boolean
  content: <T>(user: JwtGuardUser<T>) => Record<string | number, any>
}): GuardConfigProvider<(ctx: HttpContext) => JwtGuard<UserProvider>> {
  return {
    async resolver(_, app) {
      const appKey = (app.config.get('app.appKey') as Secret<string>).release()
      const options = {
        secret: appKey,
        expiresIn: config.tokenExpiresIn,
        useCookies: config.useCookies,
        content: config.content,
      }
      return (ctx) => new JwtGuard(ctx, config.provider, options)
    },
  }
}
