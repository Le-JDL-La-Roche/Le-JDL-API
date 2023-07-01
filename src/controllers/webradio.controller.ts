import db from '$utils/database'
import { SUCCESS, count } from '$models/types'
import { DataSuccess } from '$responses/success/data-success.response'
import { NextFunction } from 'express'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DefaultSuccess } from '$responses/success/default-success.response'
import { WebradioShow } from '$models/features/webradio-show.model'
import { IncomingHttpHeaders } from 'http'
import nexter from '$utils/nexter'
import { AuthService } from '$services/auth.service'
import { RequestException } from '$responses/exceptions/request-exception.response'

export default class Webradio {
  async getPublishedWebradioShows(next: NextFunction): Promise<DataSuccess<{ shows: WebradioShow[] }>> {
    var webradioShows: WebradioShow[] = []

    try {
      webradioShows = await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE status = 2 ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { shows: webradioShows })
  }

  async getCurrentWebradioShow(next: NextFunction): Promise<DataSuccess<{ show: WebradioShow } | null>> {
    var webradioShow: WebradioShow

    try {
      webradioShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE status = 0 ORDER BY date DESC'))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (webradioShow && webradioShow.id) {
      return new DataSuccess(200, SUCCESS, 'Success', { show: webradioShow })
    } else {
      return new DataSuccess(200, SUCCESS, 'No show', null)
    }
  }

  async getAllWebradioShows(headers: IncomingHttpHeaders, next: NextFunction): Promise<DataSuccess<{ shows: WebradioShow[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    var webradioShows: WebradioShow[] = []

    try {
      webradioShows = await db.query<WebradioShow[]>('SELECT * FROM webradio_shows ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { shows: webradioShows })
  }

  async getWebradioShow(headers: IncomingHttpHeaders, showId: number, next: NextFunction): Promise<DataSuccess<{ show: WebradioShow }>> {
    var webradioShow: WebradioShow

    try {
      webradioShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE id = ?', +showId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!webradioShow || !webradioShow.id) {
      next(new RequestException('Show not found'))
      throw null
    }

    if (webradioShow.status != 0 && webradioShow.status != 2) {
      const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

      if (!auth.status) {
        next(auth.exception)
        throw null
      }
    }

    return new DataSuccess(200, SUCCESS, 'Success', { show: webradioShow })
  }

  async postWebradioShow(
    headers: IncomingHttpHeaders,
    body: WebradioShow,
    file: Express.Multer.File | null,
    next: NextFunction
  ): Promise<DataSuccess<{ shows: WebradioShow[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    if (!body.title || !body.description || !file || !body.streamId || !body.date || !body.status) {
      next(new RequestException('Missing parameters'))
      throw null
    }

    if (+body.status != -1 && +body.status != 0 && +body.status != 1 && +body.status != 2) {
      next(new RequestException('Invalid parameters'))
      throw null
    }

    let liveShow: WebradioShow

    try {
      liveShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE status = 0'))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (liveShow && liveShow.id && +body.status == 0) {
      next(new RequestException('A show is already live'))
      throw null
    }

    try {
      await db.query('INSERT INTO webradio_shows (title, description, thumbnail, stream_id, podcast_id, date, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        body.title + '',
        body.description + '',
        file.filename + '',
        body.streamId + '',
        body.podcastId + '',
        body.date + '',
        +body.status
      ])
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    var webradioShows: WebradioShow[] = []

    try {
      webradioShows = await db.query<WebradioShow[]>('SELECT * FROM webradio_shows ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { shows: webradioShows })
  }

  async putWebradioShow(
    headers: IncomingHttpHeaders,
    showId: number,
    body: WebradioShow,
    file: Express.Multer.File | null,
    next: NextFunction
  ): Promise<DataSuccess<{ shows: WebradioShow[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    var webradioShow: WebradioShow

    try {
      webradioShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE id = ?', +showId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!webradioShow || !webradioShow.id) {
      next(new RequestException('Show not found'))
      throw null
    }

    if (body.status != null && body.status != undefined && +body.status != -1 && +body.status != 0 && +body.status != 1 && +body.status != 2) {
      next(new RequestException('Invalid parameters'))
      throw null
    }

    let liveShow: WebradioShow

    try {
      liveShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE status = 0'))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (liveShow && liveShow.id && liveShow.id != webradioShow.id && +body.status == 0) {
      next(new RequestException('A show is already live'))
      throw null
    }

    webradioShow = {
      title: body.title ? body.title + '' : webradioShow.title,
      description: body.description ? body.description + '' : webradioShow.description,
      thumbnail: file ? file.filename + '' : webradioShow.thumbnail,
      streamId: body.streamId ? body.streamId + '' : webradioShow.streamId,
      podcastId: body.podcastId ? body.podcastId + '' : webradioShow.podcastId,
      date: body.date ? body.date + '' : webradioShow.date,
      status: body.status ? body.status : webradioShow.status
    }

    try {
      await db.query(
        'UPDATE webradio_shows SET title = ?, description = ?, thumbnail = ?, stream_id = ?, podcast_id = ?, date = ?, status = ? WHERE id = ?',
        [
          webradioShow.title,
          webradioShow.description,
          webradioShow.thumbnail,
          webradioShow.streamId,
          webradioShow.podcastId,
          webradioShow.date,
          webradioShow.status,
          +showId
        ]
      )
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    var webradioShows: WebradioShow[] = []

    try {
      webradioShows = await db.query<WebradioShow[]>('SELECT * FROM webradio_shows ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { shows: webradioShows })
  }

  async deleteWebradioShow(headers: IncomingHttpHeaders, showId: number, next: NextFunction): Promise<DataSuccess<{ shows: WebradioShow[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    var webradioShow: WebradioShow

    try {
      webradioShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE id = ?', +showId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!webradioShow || !webradioShow.id) {
      next(new RequestException('Show not found'))
      throw null
    }

    try {
      await db.query('DELETE FROM webradio_shows WHERE id = ?', +showId)
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    var webradioShows: WebradioShow[] = []

    try {
      webradioShows = await db.query<WebradioShow[]>('SELECT * FROM webradio_shows ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { shows: webradioShows })
  }
}
