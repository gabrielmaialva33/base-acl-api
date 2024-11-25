import BaseException from '#exceptions/base_exception'

export default class UnauthorizedException extends BaseException {
  static status = 401
}
