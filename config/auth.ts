import { defineConfig } from '@adonisjs/auth'
import { tokensGuard, tokensUserProvider } from '@adonisjs/auth/access_tokens'
import type { Authenticators, InferAuthEvents } from '@adonisjs/auth/types'

/*
 * Uncomment the following snippet if you want to use
 * the JWT guard for authenticating users.
 */

// const authConfig = defineConfig({
//   default: 'jwt',
//   guards: {
//     jwt: jwtGuard({
//       // tokenExpiresIn is the duration of the validity of the token, it's a optional value
//       tokenExpiresIn: '1h',
//       // if you want to use cookies for the authentication instead of the bearer token (optional)
//       useCookies: true,
//       provider: sessionUserProvider({
//         model: () => import('#modules/user/models/user'),
//       }),s
//     }),
//   },
// })

const authConfig = defineConfig({
  default: 'api',
  guards: {
    api: tokensGuard({
      provider: tokensUserProvider({
        tokens: 'accessTokens',
        model: () => import('#modules/user/models/user'),
      }),
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
