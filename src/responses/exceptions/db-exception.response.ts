import { DB_ERROR } from '$models/types'
import { DefaultException } from './default-exception.response'

export class DBException extends DefaultException {
  constructor(message: string = 'Unknown Database error', error?: any) {
    super(500, DB_ERROR, message, error)
  }
}
