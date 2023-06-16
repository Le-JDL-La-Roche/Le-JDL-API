import jwt from '$utils/jwt'
import { DefaultServiceResponse } from '$models/responses/services/default-service-response.model'
import { AUTH_ERROR, DB_ERROR, SUCCESS, UNKNOWN_ERROR } from '$models/types'
import dotenv from 'dotenv'

dotenv.config()

export class AuthService {
  async checkAuth(auth: string, type: 'Basic' | 'Bearer' | null = null): Promise<DefaultServiceResponse> {
    if (!auth.startsWith('Basic ') && !auth.startsWith('Bearer ')) {
      return { status: false, code: AUTH_ERROR }
    }

    if (type && auth.split(' ')[0] != type) {
      return { status: false, code: AUTH_ERROR }
    }

    if (auth.startsWith('Basic')) {
      const [name, password] = Buffer.from(auth.split(' ')[1], 'base64').toString('ascii').split(':')

      if (name == process.env['ADMIN_USERNAME'] && password == process.env['ADMIN_PASSWORD'])
        return { status: true, code: SUCCESS }
    }

    if (auth.startsWith('Bearer ')) {
      const dec = await jwt.verify(auth.split(' ')[1])      

      if (!dec[0]) {
        if (dec[1] == 401) {
          return { status: false, code: AUTH_ERROR, message: dec[2] }
        } else if (dec[1] == 500) {
          return { status: false, code: DB_ERROR }
        } else {
          return { status: false, code: UNKNOWN_ERROR }
        }
      } else if (!jwt.isJwtPayload(dec[1])) {
        return { status: false, code: AUTH_ERROR }
      }

      if (dec[1].name != process.env['ADMIN_USERNAME']) {
        return { status: false, code: AUTH_ERROR }
      }

      return { status: true, code: SUCCESS }
    }

    return { status: false, code: AUTH_ERROR }
  }
}
