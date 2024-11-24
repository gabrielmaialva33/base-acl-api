import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

type ExceptionJSONResponse = {
  status: number
  message: string
}

export default class BaseException extends Exception {
  static status = 400

  async handle(error: this, ctx: HttpContext) {
    const response: ExceptionJSONResponse = {
      status: error.status,
      message: error.message,
    }
    ctx.response.status(error.status).json(response)
  }
}
