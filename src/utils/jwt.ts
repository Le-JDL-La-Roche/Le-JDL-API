import db from './database'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { count } from '$models/types'

class JWT {
  async verify(token: string): Promise<[true, JwtPayload | string] | [false, number, string]> {
    const secretKey = process.env['JWT_SECRET_KEY']
    var decoded: JwtPayload | string
    var isJwt: count

    try {
      decoded = jwt.verify(token, secretKey + '')
    } catch (error: any) {
      if (error.message == 'jwt expired') {
        return [false, 401, 'Token expired']
      } else {
        return [false, 401, 'Unauthorized']
      }
    }

    try {
      isJwt = (await db.query<count[]>('SELECT COUNT(*) AS count FROM exp_jwt WHERE jwt = ?', [token]))[0]
    } catch (error: any) {
      return [false, 500, 'DataBase']
    }

    if (isJwt.count > 0) {
      return [false, 401, 'Token expired']
    }

    return [true, decoded]
  }

  generate(): string {
    const secretKey = process.env['JWT_SECRET_KEY'] + ''

    return jwt.sign(
      {
        name: 'lejdl@laroche.org',
      },
      secretKey,
      { subject: 0 + '', expiresIn: '30 days' }
    )
  }

  isJwtPayload(object: any): object is JwtPayload {
    return 'exp' in object && 'iat' in object
  }
}

export default new JWT()
