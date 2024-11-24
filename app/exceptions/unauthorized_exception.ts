import BaseException from '#exceptions/base_exception'

export default class NotFoundException extends BaseException {
  static status = 404
}
