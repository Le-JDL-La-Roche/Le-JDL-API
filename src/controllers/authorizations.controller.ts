import db from '$utils/database'
import { AuthService } from '$services/auth.service'
import { ControllerException, SUCCESS, count } from '$models/types'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DataSuccess } from '$responses/success/data-success.response'
import { IncomingHttpHeaders } from 'http'
import nexter from '$utils/nexter'
import { Authorization } from '$models/data/authorization.model'
import { RequestException } from '$responses/exceptions/request-exception.response'
import { WebradioShow } from '$models/features/webradio-show.model'
import { Video } from '$models/features/video.model'
import { Article } from '$models/features/article.model'

export default class Authorizations {
  async getAuthorizations(headers: IncomingHttpHeaders): Promise<DataSuccess<{ authorizations: Authorization[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let authorizations: Authorization[] = []

    try {
      authorizations = await db.query<Authorization[]>('SELECT * FROM authorizations')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { authorizations })
  }

  async getAuthorization(headers: IncomingHttpHeaders, authorizationId: number): Promise<DataSuccess<{ authorization: Authorization }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let authorization: Authorization

    try {
      authorization = (await db.query<Authorization[]>('SELECT * FROM authorizations WHERE id = ?', +authorizationId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!authorization || !authorization.id) {
      throw new RequestException('Authorization not found')
    }

    return new DataSuccess(200, SUCCESS, 'Success', { authorization })
  }

  async postAuthorization(headers: IncomingHttpHeaders, body: Authorization): Promise<DataSuccess<{ authorizations: Authorization[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    if (
      !body.elementId ||
      (body.elementType !== 'show' && body.elementType !== 'video' && body.elementType !== 'article') ||
      !body.content ||
      typeof body.content !== 'string'
    ) {
      throw new RequestException('Invalid parameters')
    }

    let elementId: number

    try {
      elementId = await this.checkElement(body)
    } catch (error) {
      throw error
    }

    let authorization: count

    try {
      authorization = (
        await db.query<count[]>('SELECT COUNT(*) AS count FROM authorizations WHERE element_type = ? AND element_id = ?', [
          body.elementType,
          elementId
        ])
      )[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (authorization.count > 0) {
      throw new RequestException('Authorization already exists')
    }

    try {
      await db.query('INSERT INTO authorizations (element_type, element_id, content) VALUES (?, ?, ?)', [
        body.elementType,
        +body.elementId,
        body.content as string
      ])
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let authorizations: Authorization[] = []

    try {
      authorizations = await db.query<Authorization[]>('SELECT * FROM authorizations')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(201, SUCCESS, 'Success', { authorizations })
  }

  async putAuthorization(
    headers: IncomingHttpHeaders,
    authorizationId: number,
    body: Authorization
  ): Promise<DataSuccess<{ authorizations: Authorization[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let authorization: Authorization

    try {
      authorization = (await db.query<Authorization[]>('SELECT* FROM authorizations WHERE id = ?', +authorizationId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!authorization || !authorization.id) {
      throw new RequestException('Authorization not found')
    }

    if (
      body.elementType &&
      body.elementType !== 'show' &&
      body.elementType !== 'video' &&
      body.elementType !== 'article' &&
      body.elementType !== 'guest'
    ) {
      throw new RequestException('Invalid parameters')
    }

    try {
      await this.checkElement(body)
    } catch (error) {
      throw error
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
      throw new DBException(undefined, error)
    }

    let authorizations: Authorization[] = []

    try {
      authorizations = await db.query<Authorization[]>('SELECT * FROM authorizations')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { authorizations })
  }

  async deleteAuthorization(headers: IncomingHttpHeaders, authorizationId: number): Promise<DataSuccess<{ authorizations: Authorization[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let authorization: Authorization

    try {
      authorization = (await db.query<Authorization[]>('SELECT* FROM authorizations WHERE id = ?', +authorizationId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!authorization || !authorization.id) {
      throw new RequestException('Authorization not found')
    }

    try {
      await db.query('DELETE FROM authorizations WHERE id = ?', authorizationId)
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let authorizations: Authorization[] = []

    try {
      authorizations = await db.query<Authorization[]>('SELECT * FROM authorizations')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { authorizations })
  }

  private async checkElement(body: Authorization): Promise<number> {
    if (body.elementType === 'show') {
      let show: WebradioShow

      if (!body.elementId || +body.elementId === 0) {
        try {
          show = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows ORDER BY ID DESC LIMIT 1'))[0]
        } catch (error) {
          throw new DBException(undefined, error)
        }
      } else {
        try {
          show = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE id = ?', body.elementId))[0]
        } catch (error) {
          throw new DBException(undefined, error)
        }
      }


      if (!show || !show.id) {
        throw new RequestException('Show not found')
      }

      return show.id
    } else if (body.elementType === 'video') {
      let video: Video

      if (!body.elementId || +body.elementId === 0) {
        try {
          video = (await db.query<Video[]>('SELECT * FROM videos ORDER BY ID DESC LIMIT 1'))[0]
        } catch (error) {
          throw new DBException(undefined, error)
        }
      } else {
        try {
          video = (await db.query<Video[]>('SELECT * FROM videos WHERE id = ?', body.elementId))[0]
        } catch (error) {
          throw new DBException(undefined, error)
        }
      }

      if (!video || !video.id) {
        throw new RequestException('Video not found')
      }

      return video.id
    } else if (body.elementType === 'article') {
      let article: Article

      if (!body.elementId || +body.elementId === 0) {
        try {
          article = (await db.query<Article[]>('SELECT * FROM articles ORDER BY ID DESC LIMIT 1'))[0]
        } catch (error) {
          throw new DBException(undefined, error)
        }
      } else {
        try {
          article = (await db.query<Article[]>('SELECT * FROM articles WHERE id = ?', body.elementId))[0]
        } catch (error) {
          throw new DBException(undefined, error)
        }
      }

      if (!article || !article.id) {
        throw new RequestException('Article not found')
      }

      return article.id
    }

    return 0
  }
}
