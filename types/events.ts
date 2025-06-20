import type {
  LoginAttemptedEventData,
  LoginSucceededEventData,
  LoginFailedEventData,
  LogoutEventData,
  UserRegisteredEventData,
  TokenRefreshedEventData,
} from '#modules/user/events/auth_events'

declare module '@adonisjs/core/types' {
  interface EventsList {
    'auth:login_attempted': LoginAttemptedEventData
    'auth:login_succeeded': LoginSucceededEventData
    'auth:login_failed': LoginFailedEventData
    'auth:logout': LogoutEventData
    'auth:user_registered': UserRegisteredEventData
    'auth:token_refreshed': TokenRefreshedEventData
  }
}
