import { defineConfig } from '@adonisjs/auth'
import { tokensGuard, tokensUserProvider } from '@adonisjs/auth/access_tokens'
import type { Authenticators, InferAuthEvents } from '@adonisjs/auth/types'
import { sessionGuard, sessionUserProvider } from '@adonisjs/auth/session'
import { basicAuthGuard, basicAuthUserProvider } from '@adonisjs/auth/basic_auth'

import { jwtGuard } from '#auth/guards/jwt/define_config'
import { JwtGuardUser } from '#auth/guards/jwt/types'

const authConfig = defineConfig({
  default: 'jwt',
  guards: {
    api: tokensGuard({
      provider: tokensUserProvider({
        tokens: 'accessTokens',
        model: () => import('#modules/user/models/user'),
      }),
    }),
    web: sessionGuard({
      useRememberMeTokens: false,
      provider: sessionUserProvider({
        model: () => import('#modules/user/models/user'),
      }),
    }),
    basicAuth: basicAuthGuard({
      provider: basicAuthUserProvider({
        model: () => import('#modules/user/models/user'),
      }),
    }),
    jwt: jwtGuard({
      tokenExpiresIn: '1h',
      useCookies: true,
      provider: sessionUserProvider({
        model: () => import('#modules/user/models/user'),
      }),
      content: <User>(user: JwtGuardUser<User>) => ({ userId: user.getId() }),
    }),
  },
})

export default authConfig

/**
 * Inferring types from the configured auth
 * guards.
 */
declare module '@adonisjs/auth/types' {
  export interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
declare module '@adonisjs/core/types' {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}
