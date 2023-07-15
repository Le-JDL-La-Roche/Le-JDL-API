import db from '$utils/database'
import { AuthService } from '$services/auth.service'
import { SUCCESS, count } from '$models/types'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DataSuccess } from '$responses/success/data-success.response'
import { NextFunction } from 'express'
import { IncomingHttpHeaders } from 'http'
import { DefaultSuccess } from '$responses/success/default-success.response'
import nexter from '$utils/nexter'
import { ArticleAuthorization, Authorization, GuestAuthorization, VideoAuthorization, WebradioAuthorization } from '$models/data/authorization.model'
import { RequestException } from '$responses/exceptions/request-exception.response'

export default class Authorizations {
  async getAuthorizations(headers: IncomingHttpHeaders, next: NextFunction): Promise<DataSuccess<{ authorizations: Authorization[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    let authorizations: Authorization[] = []

    try {
      authorizations = await db.query<Authorization[]>('SELECT * FROM authorizations')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { authorizations })
  }

  async getAuthorization(
    headers: IncomingHttpHeaders,
    authorizationId: number,
    next: NextFunction
  ): Promise<DataSuccess<{ authorization: Authorization }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    let authorization: Authorization

    try {
      authorization = (await db.query<Authorization[]>('SELECT * FROM authorizations WHERE id = ?', +authorizationId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!authorization || !authorization.id) {
      next(new RequestException('Authorization not found'))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { authorization })
  }

  async postAuthorization(
    headers: IncomingHttpHeaders,
    body: Authorization,
    next: NextFunction
  ): Promise<DataSuccess<{ authorizations: Authorization[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    if (
      !body.elementId ||
      (body.elementType !== 'show' && body.elementType !== 'video' && body.elementType !== 'article' && body.elementType !== 'guest') ||
      !body.content ||
      typeof body.content !== 'string'
    ) {
      next(new RequestException('Invalid parameters'))
      throw null
    }

    try {
      await this.checkElement(body)
    } catch (error) {
      next(error)
      throw null
    }

    let authorization: count

    try {
      authorization = (
        await db.query<count[]>('SELECT COUNT(*) AS count FROM authorizations WHERE element_type = ? AND element_id = ?', [
          body.elementType,
          body.elementId
        ])
      )[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (authorization.count > 0) {
      next(new RequestException('Authorization already exists'))
      throw null
    }

    try {
      await db.query('INSERT INTO authorizations (element_type, element_id, content) VALUES (?, ?, ?)', [
        body.elementType,
        +body.elementId,
        body.content as string
      ])
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    let authorizations: Authorization[] = []

    try {
      authorizations = await db.query<Authorization[]>('SELECT * FROM authorizations')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(201, SUCCESS, 'Success', { authorizations })
  }

  async putAuthorization(
    headers: IncomingHttpHeaders,
    authorizationId: number,
    body: Authorization,
    next: NextFunction
  ): Promise<DataSuccess<{ authorizations: Authorization[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    let authorization: Authorization

    try {
      authorization = (await db.query<Authorization[]>('SELECT* FROM authorizations WHERE id = ?', +authorizationId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!authorization || !authorization.id) {
      next(new RequestException('Authorization not found'))
      throw null
    }

    if (
      body.elementType &&
      body.elementType !== 'show' &&
      body.elementType !== 'video' &&
      body.elementType !== 'article' &&
      body.elementType !== 'guest'
    ) {
      next(new RequestException('Invalid parameters'))
      throw null
    }

    try {
      await this.checkElement(body)
    } catch (error) {
      next(error)
      throw null
    }

    authorization = {
      elementType: body.elementType ? body.elementType : authorization.elementType,
      elementId: body.elementId ? body.elementId : authorization.elementId,
      content: body.content ? body.content : authorization.content
    }

    try {
      await db.query('UPDATE authorizations SET element_type = ?, element_id = ?, content = ? WHERE id = ?', [
        authorization.elementType,
        authorization.elementId,
        authorization.content,
        authorizationId
      ])
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    let authorizations: Authorization[] = []

    try {
      authorizations = await db.query<Authorization[]>('SELECT * FROM authorizations')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { authorizations })
  }

  async deleteAuthorization(headers: IncomingHttpHeaders, authorizationId: number, next: NextFunction): Promise<DataSuccess<{authorizations: Authorization[]}>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    let authorization: Authorization

    try {
      authorization = (await db.query<Authorization[]>('SELECT* FROM authorizations WHERE id = ?', +authorizationId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!authorization || !authorization.id) {
      next(new RequestException('Authorization not found'))
      throw null
    }

    try {
      await db.query('DELETE FROM authorizations WHERE id = ?', authorizationId)
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    let authorizations: Authorization[] = []

    try {
      authorizations = await db.query<Authorization[]>('SELECT * FROM authorizations')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { authorizations })
  }

  private async checkElement(body: Authorization): Promise<void> {
    if (body.elementType === 'show') {
      let show: count

      try {
        show = (await db.query<count[]>('SELECT COUNT(*) AS count FROM webradio_shows WHERE id = ?', body.elementId))[0]
      } catch (error) {
        throw new DBException(undefined, error)
      }

      if (show.count === 0) {
        throw new RequestException('Show not found')
      }
    } else if (body.elementType === 'video') {
      let video: count

      try {
        video = (await db.query<count[]>('SELECT COUNT(*) AS count FROM videos WHERE id = ?', body.elementId))[0]
      } catch (error) {
        throw new DBException(undefined, error)
      }

      if (video.count === 0) {
        throw new RequestException('Video not found')
      }
    } else if (body.elementType === 'article') {
      let article: count

      try {
        article = (await db.query<count[]>('SELECT COUNT(*) AS count FROM articles WHERE id = ?', body.elementId))[0]
      } catch (error) {
        throw new DBException(undefined, error)
      }

      if (article.count === 0) {
        throw new RequestException('Article not found')
      }
    }
  }
}
