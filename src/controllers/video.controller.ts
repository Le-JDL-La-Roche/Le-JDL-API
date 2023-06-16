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

  async getVideos(next: NextFunction): Promise<DataSuccess<{ videos: Video[] }>> {
    var videos: Video[] = []

    try {
      videos = await db.query<Video[]>('SELECT * FROM videos ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { videos: videos })
  }

  async getVideo(videoId: number, next: NextFunction): Promise<DataSuccess<{ video: Video }>> {
    var video: Video

    try {
      video = (await db.query<Video[]>('SELECT * FROM videos WHERE id = ?', videoId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!video || !video.id) {
      next(new RequestException('Video not found'))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { video: video })
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

    if (!body.title || !body.description || !file || !body.type || !body.videoId || !body.category) {
      next(new RequestException('Missing parameters'))
      throw null
    }

    if ((body.type != 'youtube' && body.type != 'instagram') || !this.cat.includes(body.category)) {
      next(new RequestException('Invalid parameter'))
      throw null
    }

    try {
      await db.query('INSERT INTO videos (title, description, thumbnail, video_id, type, category, date) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        body.title + '',
        body.description + '',
        file.filename + '',
        body.videoId + '',
        body.type + '',
        body.category + '',
        Math.round(Date.now() / 1000)
      ])
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    var videos: Video[] = []

    try {
      videos = await db.query<Video[]>('SELECT * FROM videos ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { videos: videos })
  }

  async putVideo(
    headers: IncomingHttpHeaders,
    body: Video,
    videoId: number,
    file: Express.Multer.File | null,
    next: NextFunction
  ): Promise<DataSuccess<{ videos: Video[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    var video: Video

    try {
      video = (await db.query<Video[]>('SELECT * FROM videos WHERE id = ?', videoId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!video || !video.id) {
      next(new RequestException('Video not found'))
      throw null
    }

    if ((body.category != null && !this.cat.includes(body.category)) || (body.type != null && body.type != 'youtube' && body.type != 'instagram')) {
      next(new RequestException('Invalid parameter'))
      throw null
    }

    video = {
      title: body.title ? body.title + '' : video.title,
      description: body.description ? body.description + '' : video.description,
      thumbnail: file ? file.filename + '' : video.thumbnail,
      videoId: body.videoId ? body.videoId + '' : video.videoId,
      type: body.type ? body.type : video.type,
      category: body.category ? body.category : video.category,
      date: body.date ? body.date : video.date
    }

    try {
      await db.query('UPDATE videos SET title = ?, description = ?, thumbnail = ?, video_id = ?, type = ?, category = ?, date = ? WHERE id = ?', [
        video.title,
        video.description,
        video.thumbnail,
        video.videoId,
        video.type,
        video.category,
        video.date,
        videoId
      ])
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    var videos: Video[] = []

    try {
      videos = await db.query<Video[]>('SELECT * FROM videos ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { videos: videos })
  }

  async deleteVideo(headers: IncomingHttpHeaders, videoId: number, next: NextFunction): Promise<DataSuccess<{ videos: Video[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    var video: Video

    try {
      video = (await db.query<Video[]>('SELECT * FROM videos WHERE id = ?', videoId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!video || !video.id) {
      next(new RequestException('Video not found'))
      throw null
    }

    try {
      await db.query('DELETE FROM videos WHERE id = ?', videoId)
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    var videos: Video[] = []

    try {
      videos = await db.query<Video[]>('SELECT * FROM videos ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { videos: videos })
  }
}
