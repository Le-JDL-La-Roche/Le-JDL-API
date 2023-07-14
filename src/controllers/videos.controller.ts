import { Video } from '$models/features/video.model'
import { DBException } from '$responses/exceptions/db-exception.response'
import { NextFunction } from 'express'
import db from '$utils/database'
import { DataSuccess } from '$responses/success/data-success.response'
import { SUCCESS } from '$models/types'
import { RequestException } from '$responses/exceptions/request-exception.response'
import { IncomingHttpHeaders } from 'http'
import nexter from '$utils/nexter'
import { AuthService } from '$services/auth.service'

export default class Videos {
  private readonly cat = ['news', 'culture', 'sport', 'science', 'tech', 'laroche']

  async getPublishedVideos(next: NextFunction): Promise<DataSuccess<{ videos: Video[] }>> {
    let videos: Video[] = []

    try {
      videos = await db.query<Video[]>('SELECT * FROM videos WHERE status = 2 ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { videos })
  }

  async getAllVideos(headers: IncomingHttpHeaders, next: NextFunction): Promise<DataSuccess<{ videos: Video[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    let videos: Video[] = []

    try {
      videos = await db.query<Video[]>('SELECT * FROM videos ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { videos })
  }

  async getVideo(headers: IncomingHttpHeaders, videoId: number, next: NextFunction): Promise<DataSuccess<{ video: Video }>> {
    let video: Video

    try {
      video = (await db.query<Video[]>('SELECT * FROM videos WHERE id = ?', +videoId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!video || !video.id) {
      next(new RequestException('Video not found'))
      throw null
    }

    if (video.status == -1) {
      const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

      if (!auth.status) {
        next(auth.exception)
        throw null
      }
    }

    return new DataSuccess(200, SUCCESS, 'Success', { video })
  }

  async postVideo(
    headers: IncomingHttpHeaders,
    body: Video,
    file: Express.Multer.File | null,
    next: NextFunction
  ): Promise<DataSuccess<{ videos: Video[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    if (!body.title || !body.description || !file || !body.type || !body.videoId || !body.category || !body.author || !body.status) {
      next(new RequestException('Missing parameters'))
      throw null
    }

    if ((body.type != 'youtube' && body.type != 'instagram') || !this.cat.includes(body.category)) {
      next(new RequestException('Invalid parameters'))
      throw null
    }

    if (+body.status != -1 && +body.status != 2) {
      next(new RequestException('Invalid parameters'))
      throw null
    }

    try {
      await db.query(
        'INSERT INTO videos (title, description, thumbnail, video_id, type, category, author, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          body.title + '',
          body.description + '',
          file.filename + '',
          body.videoId + '',
          body.type + '',
          body.category + '',
          body.author + '',
          Math.round(Date.now() / 1000),
          +body.status
        ]
      )
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    let videos: Video[] = []

    try {
      videos = await db.query<Video[]>('SELECT * FROM videos ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { videos })
  }

  async putVideo(
    headers: IncomingHttpHeaders,
    videoId: number,
    body: Video,
    file: Express.Multer.File | null,
    next: NextFunction
  ): Promise<DataSuccess<{ videos: Video[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    let video: Video

    try {
      video = (await db.query<Video[]>('SELECT * FROM videos WHERE id = ?', +videoId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!video || !video.id) {
      next(new RequestException('Video not found'))
      throw null
    }

    if (
      (body.category != null && body.category != '' && !this.cat.includes(body.category)) ||
      (body.type != null && body.type! != '' && body.type != 'youtube' && body.type != 'instagram')
    ) {
      next(new RequestException('Invalid parameters'))
      throw null
    }

    if (body.status != null && body.status != undefined && +body.status != -1 && +body.status != 2) {
      next(new RequestException('Invalid parameters'))
      throw null
    }

    video = {
      title: body.title ? body.title + '' : video.title,
      description: body.description ? body.description + '' : video.description,
      thumbnail: file ? file.filename + '' : video.thumbnail,
      videoId: body.videoId ? body.videoId + '' : video.videoId,
      type: body.type ? body.type : video.type,
      category: body.category ? body.category : video.category,
      author: body.author ? body.author + '' : video.author,
      date: video.date,
      status: body.status ? (+body.status as -1 | 2) : video.status
    }

    try {
      await db.query(
        'UPDATE videos SET title = ?, description = ?, thumbnail = ?, video_id = ?, type = ?, category = ?, author = ?, status = ? WHERE id = ?',
        [video.title, video.description, video.thumbnail, video.videoId, video.type, video.category, video.author, video.status, +videoId]
      )
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    let videos: Video[] = []

    try {
      videos = await db.query<Video[]>('SELECT * FROM videos ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { videos })
  }

  async deleteVideo(headers: IncomingHttpHeaders, videoId: number, next: NextFunction): Promise<DataSuccess<{ videos: Video[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    let video: Video

    try {
      video = (await db.query<Video[]>('SELECT * FROM videos WHERE id = ?', +videoId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!video || !video.id) {
      next(new RequestException('Video not found'))
      throw null
    }

    try {
      await db.query('DELETE FROM videos WHERE id = ?', +videoId)
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    let videos: Video[] = []

    try {
      videos = await db.query<Video[]>('SELECT * FROM videos ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { videos })
  }
}
