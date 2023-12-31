import { ErrorCode } from '$models/types'

export class DefaultException {
  httpStatus: number
  code: ErrorCode
  message: string

  constructor(httpStatus: number, code: ErrorCode, message: string = '', error?: any) {
    this.httpStatus = httpStatus
    this.code = code
    this.message = message
    if (error) {
      console.error(error)
    }
  }
}
