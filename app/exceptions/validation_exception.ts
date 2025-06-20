import BaseException from '#exceptions/base_exception'

export default class ValidationException extends BaseException {
  static status = 400
  static code = 'E_VALIDATION_ERROR'
}
