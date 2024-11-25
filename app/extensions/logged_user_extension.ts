import { HttpContext } from '@adonisjs/core/http'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    getLoggedUserId: (loggedUserId: number) => number
    loggedUserId: number
  }
}

HttpContext.macro('getLoggedUserId', function loggedUserId(id: number) {
  return id
})
