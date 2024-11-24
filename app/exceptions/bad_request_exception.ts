import BaseException from '#exceptions/base_exception'

export default class BadRequestException extends BaseException {
  static status = 400
}
