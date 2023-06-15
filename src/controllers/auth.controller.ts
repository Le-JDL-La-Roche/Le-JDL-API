import db from '$utils/database'
import { AuthService } from '$services/auth.service'
import { SUCCESS } from '$models/types'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DataSuccess } from '$responses/success/data-success.response'
import { NextFunction } from 'express'
import { IncomingHttpHeaders } from 'http'
import { DefaultSuccess } from '$responses/success/default-success.response'
import jwt from '$utils/jwt'
import nexter from '$utils/nexter'

class Auth {
  async auth(headers: IncomingHttpHeaders, next: NextFunction): Promise<DataSuccess<{ jwt: string }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Basic'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { jwt: jwt.generate() })
  }

  async verify(headers: IncomingHttpHeaders, next: NextFunction): Promise<DataSuccess<{ jwt: string }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    const token = (headers['authorization'] + '').split(' ')[1]

    return new DataSuccess(200, SUCCESS, 'Success', { jwt: token })
  }

  async logout(headers: IncomingHttpHeaders, next: NextFunction): Promise<DefaultSuccess> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    const token = (headers['authorization'] + '').split(' ')[1]

    try {
      await db.query('INSERT INTO exp_jwt (jwt) VALUES (?)', [token])
    } catch (error: any) {
      next(new DBException())
      throw null
    }

    return new DefaultSuccess()
  }
}

export default Auth
