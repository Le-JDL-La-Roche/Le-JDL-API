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

export default class Auth {
  async auth(headers: IncomingHttpHeaders): Promise<DataSuccess<{ jwt: string }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Basic'))

    if (!auth.status) {
      throw auth.exception
    }

    return new DataSuccess(200, SUCCESS, 'Success', { jwt: jwt.generate() })
  }

  async verify(headers: IncomingHttpHeaders): Promise<DataSuccess<{ jwt: string }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      throw auth.exception
    }

    const token = (headers['authorization'] + '').split(' ')[1]

    return new DataSuccess(200, SUCCESS, 'Success', { jwt: token })
  }

  async logout(headers: IncomingHttpHeaders): Promise<DefaultSuccess> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      throw auth.exception
    }

    const token = (headers['authorization'] + '').split(' ')[1]

    try {
      await db.query('INSERT INTO exp_jwt (jwt) VALUES (?)', [token])
    } catch (error: any) {
      throw new DBException()
    }

    return new DefaultSuccess()
  }
}
