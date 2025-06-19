import BaseException from '#exceptions/base_exception'

export default class ForbiddenException extends BaseException {
  static status = 403
}
