import db from '$utils/database'
import { AuthService } from '$services/auth.service'
import { ControllerException, SUCCESS, count } from '$models/types'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DataSuccess } from '$responses/success/data-success.response'
import { IncomingHttpHeaders } from 'http'
import nexter from '$utils/nexter'
import { ArticleAuthorization, Authorization, VideoAuthorization, WebradioAuthorization } from '$models/data/authorization.model'
import { RequestException } from '$responses/exceptions/request-exception.response'
import { WebradioShow } from '$models/features/webradio-show.model'
import { Video } from '$models/features/video.model'
import { Article } from '$models/features/article.model'
import crypto from 'crypto'
import { IgService } from '$services/ig.service'

export default class Authorizations {
  async getAuthorizations(headers: IncomingHttpHeaders): Promise<DataSuccess<{ authorizations: Authorization[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      try {
        nexter.serviceToException(await new AuthService().checkManAuth(headers['authorization'] + ''))
      } catch (error) {
        throw error as ControllerException
      }
    }

    let authorizations: Authorization[] = []

    try {
      authorizations = await db.query<Authorization[]>('SELECT * FROM authorizations ORDER BY submit_date DESC, id DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { authorizations })
  }

  async getAuthorization(headers: IncomingHttpHeaders, authorizationId: number): Promise<DataSuccess<{ authorization: Authorization }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      try {
        nexter.serviceToException(await new AuthService().checkManAuth(headers['authorization'] + ''))
      } catch (error) {
        throw error as ControllerException
      }
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

    body.status = body.status && +body.status == -1 ? -1 : -2

    let elementId: number

    try {
      elementId = (await this.checkElement(body)).id!
    } catch (error) {
      throw error
    }

    let authorization: count

    try {
      authorization = (
        await db.query<count[]>('SELECT COUNT(*) AS count FROM authorizations WHERE element_type = ? AND element_id = ? AND status < 0', [
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
      await db.query('INSERT INTO authorizations (element_type, element_id, content, submit_date, status) VALUES (?, ?, ?, ?, ?)', [
        body.elementType,
        +body.elementId,
        body.content as string,
        Math.floor(Date.now() / 1000),
        body.status
      ])
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (body.status === -1) {
      console.debug('Send Instagram message to managers')
      // Send Instagram message to managers
    }

    let authorizations: Authorization[] = []

    try {
      authorizations = await db.query<Authorization[]>('SELECT * FROM authorizations ORDER BY submit_date DESC, id DESC')
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
    const jdlAuth = await new AuthService().checkAuth(headers['authorization'] + '')
    const manAuth = await new AuthService().checkManAuth(headers['authorization'] + '')

    
    if (jdlAuth.status) return await this.putJdlAuthorization(headers, authorizationId, body)
    if (manAuth.status) return await this.putManAuthorization(headers, authorizationId, body, manAuth.data + '')

    throw new RequestException('Unauthorized')
  }

  private async putJdlAuthorization(
    headers: IncomingHttpHeaders,
    authorizationId: number,
    body: Authorization
  ): Promise<DataSuccess<{ authorizations: Authorization[] }>> {
    let authorization: Authorization

    try {
      authorization = (await db.query<Authorization[]>('SELECT* FROM authorizations WHERE id = ?', +authorizationId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!authorization || !authorization.id) {
      throw new RequestException('Authorization not found')
    }
    
    if (authorization.status !== -2) {
      if (authorization.status === 1) {
        return this.postAuthorization(headers, body)
      }
      throw new RequestException('Authorization already submitted')
    }
    
    if (body.elementType && body.elementType !== 'show' && body.elementType !== 'video' && body.elementType !== 'article') {
      throw new RequestException('Invalid parameters')
    }
    
    let element: WebradioShow | Video | Article
    
    try {
      element = await this.checkElement(authorization)
    } catch (error) {
      throw error
    }

    authorization = {
      elementType: body.elementType ? body.elementType : authorization.elementType,
      elementId: body.elementId ? body.elementId : authorization.elementId,
      content: body.content ? body.content : authorization.content,
      status: body.status && +body.status === -1 ? -1 : -2
    }

    try {
      await db.query('UPDATE authorizations SET element_type = ?, element_id = ?, content = ?, submit_date = ?, status = ? WHERE id = ?', [
        authorization.elementType,
        authorization.elementId,
        authorization.content,
        Math.floor(Date.now() / 1000),
        authorization.status,
        authorizationId
      ])
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (authorization.status === -1) {
      await new IgService().sendMessagesToMan(element, {...authorization, id: authorizationId})
    }

    let authorizations: Authorization[] = []

    try {
      authorizations = await db.query<Authorization[]>('SELECT * FROM authorizations ORDER BY submit_date DESC, id DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { authorizations })
  }

  private async putManAuthorization(
    headers: IncomingHttpHeaders,
    authorizationId: number,
    body: Authorization,
    manId: string
  ): Promise<DataSuccess<{ authorizations: Authorization[] }>> {
    const sigPrivateKey: string = (process.env['SIG_PRIVATE_KEY'] + '').replaceAll('\\n', '\n')
    const currentDate = new Date().toLocaleDateString('fr-FR')

    let authorization: Authorization

    try {
      authorization = (await db.query<Authorization[]>('SELECT* FROM authorizations WHERE id = ?', +authorizationId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!authorization || !authorization.id) {
      throw new RequestException('Authorization not found')
    }

    if (authorization.status !== -1) {
      throw new RequestException('Response already submitted')
    }

    const id = JSON.parse(process.env['MAN_IDS'] + '').indexOf(manId)
    const name = JSON.parse(process.env['MAN_NAMES'] + '')[id]

    if (!body.status || (+body.status !== 1 && +body.status !== 2)) {
      throw new RequestException('Invalid parameters')
    }

    let element: WebradioShow | Video | Article
    
    try {
      element = await this.checkElement(authorization)
    } catch (error) {
      throw error
    }

    let signature: string

    if (+body.status === 2) {
      signature = crypto
        .privateEncrypt(
          { key: sigPrivateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
          Buffer.from(`Autorisation de publication accordée par ${name} le ${currentDate}.`)
        )
        .toString('base64')
    } else if (+body.status === 1) {
      signature = crypto
        .privateEncrypt(
          { key: sigPrivateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
          Buffer.from(`Autorisation de publication refusée par ${name} le ${currentDate}.`)
        )
        .toString('base64')
    } else {
      throw new RequestException('Invalid parameters')
    }

    try {
      await db.query('UPDATE authorizations SET status = ?, manager = ?, comments = ?, response_date = ?, signature = ? WHERE id = ?', [
        +body.status,
        name,
        body.comments ? body.comments : 'Non spécifié',
        Math.floor(Date.now() / 1000),
        signature,
        authorizationId
      ])
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (+body.status > 0) {
      new IgService().sendMessagesToJdl(element, {...authorization, status: body.status, id: authorizationId})
    }

    let authorizations: Authorization[] = []

    try {
      authorizations = await db.query<Authorization[]>('SELECT * FROM authorizations ORDER BY submit_date DESC, id DESC')
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

  private async checkElement(body: Authorization): Promise<WebradioShow | Video | Article> {
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

      return show
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

      return video
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

      return article
    }

    throw new RequestException('Invalid parameters')
  }
}

