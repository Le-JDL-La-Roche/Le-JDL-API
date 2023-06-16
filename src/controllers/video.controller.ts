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

    const cat = ['news', 'culture', 'sport', 'science', 'tech', 'laroche']

    if ((body.type != 'youtube' && body.type != 'instagram') || !cat.includes(body.category)) {
      next(new RequestException('Invalid parameter'))
      throw null
    }

    try {
      await db.query('INSERT INTO videos (title, description, miniature, video_id, type, category, date) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        body.title + '',
        body.description + '',
        file.filename + '',
        body.videoId + '',
        body.type + '',
        body.category + '',
        Date.now() / 1000
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
}
