import { Video } from '$models/features/video.model'
import { DBException } from '$responses/exceptions/db-exception.response'
import { NextFunction } from 'express'
import db from '$utils/database'
import { DataSuccess } from '$responses/success/data-success.response'
import { ControllerException, SUCCESS } from '$models/types'
import { RequestException } from '$responses/exceptions/request-exception.response'
import { IncomingHttpHeaders } from 'http'
import nexter from '$utils/nexter'
import { AuthService } from '$services/auth.service'
import { RowDataPacket } from 'mysql2'

export default class Videos {
  private readonly cat = ['news', 'culture', 'sport', 'science', 'tech', 'laroche']

  async getPublishedVideos(): Promise<DataSuccess<{ videos: Video[] }>> {
    let videos: Video[] = []

    try {
      videos = await db.query<Video[]>('SELECT * FROM videos WHERE status = 2 ORDER BY date DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { videos })
  }

  async getAllVideos(headers: IncomingHttpHeaders): Promise<DataSuccess<{ videos: Video[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      try {
        nexter.serviceToException(await new AuthService().checkManAuth(headers['authorization'] + ''))
      } catch (error) {
        throw error as ControllerException
      }
    }

    let videos: Video[] = []

    try {
      videos = await db.query<Video[]>('SELECT * FROM videos ORDER BY date DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { videos })
  }

  async getVideo(headers: IncomingHttpHeaders, videoId: number): Promise<DataSuccess<{ video: Video }>> {
    let video: Video

    try {
      video = (await db.query<Video[]>('SELECT * FROM videos WHERE id = ?', +videoId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!video || !video.id) {
      throw new RequestException('Video not found')
    }

    if (video.status == -2) {
      try {
        nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
      } catch (error: unknown) {
        try {
          nexter.serviceToException(await new AuthService().checkManAuth(headers['authorization'] + ''))
        } catch (error) {
          throw error as ControllerException
        }
      }
    }

    return new DataSuccess(200, SUCCESS, 'Success', { video })
  }

  async postVideo(
    headers: IncomingHttpHeaders,
    body: Video,
    file: Express.Multer.File | null
  ): Promise<DataSuccess<{ videos: Video[]; id: number }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    if (!body.title || !body.description || !file || !body.type || !body.videoId || !body.category || !body.author || !body.status) {
      throw new RequestException('Missing parameters')
    }

    if (!body.date) {
      body.date = Math.round(Date.now() / 1000) + ''
    }

    if (!body.status) {
      body.status = -2
    }

    if ((body.type != 'youtube' && body.type != 'instagram') || !this.cat.includes(body.category)) {
      throw new RequestException('Invalid parameters')
    }

    if (+body.status != -2 && +body.status != -1 && +body.status != 2) {
      throw new RequestException('Invalid parameters')
    }

    let videoId: number
    try {
      videoId = (
        await db.query<RowDataPacket>(
          'INSERT INTO videos (title, description, thumbnail, video_id, type, category, author, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            body.title + '',
            body.description + '',
            file.filename + '',
            body.videoId + '',
            body.type + '',
            body.category + '',
            body.author + '',
            body.date + '',
            +body.status
          ]
        )
      ).insertId
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let videos: Video[] = []

    try {
      videos = await db.query<Video[]>('SELECT * FROM videos ORDER BY date DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { videos, id: +videoId })
  }

  async putVideo(
    headers: IncomingHttpHeaders,
    videoId: number,
    body: Video,
    file: Express.Multer.File | null
  ): Promise<DataSuccess<{ videos: Video[]; id: number }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let video: Video

    try {
      video = (await db.query<Video[]>('SELECT * FROM videos WHERE id = ?', +videoId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!video || !video.id) {
      throw new RequestException('Video not found')
    }

    if (
      (body.category != null && body.category != '' && !this.cat.includes(body.category)) ||
      (body.type != null && body.type! != '' && body.type != 'youtube' && body.type != 'instagram')
    ) {
      throw new RequestException('Invalid parameters')
    }

    if (body.status != null && body.status != undefined && +body.status != -2 && +body.status != -1 && +body.status != 2) {
      throw new RequestException('Invalid parameters')
    }

    video = {
      title: body.title ? body.title + '' : video.title,
      description: body.description ? body.description + '' : video.description,
      thumbnail: file ? file.filename + '' : video.thumbnail,
      videoId: body.videoId ? body.videoId + '' : video.videoId,
      type: body.type ? body.type : video.type,
      category: body.category ? body.category : video.category,
      author: body.author ? body.author + '' : video.author,
      date: body.date ? body.date + '' : video.date,
      status: body.status ? body.status : video.status
    }

    try {
      await db.query(
        'UPDATE videos SET title = ?, description = ?, thumbnail = ?, video_id = ?, type = ?, category = ?, author = ?, date = ?, status = ? WHERE id = ?',
        [video.title, video.description, video.thumbnail, video.videoId, video.type, video.category, video.author, video.date, video.status, +videoId]
      )
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let videos: Video[] = []

    try {
      videos = await db.query<Video[]>('SELECT * FROM videos ORDER BY date DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { videos, id: +videoId })
  }

  async deleteVideo(headers: IncomingHttpHeaders, videoId: number): Promise<DataSuccess<{ videos: Video[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let video: Video

    try {
      video = (await db.query<Video[]>('SELECT * FROM videos WHERE id = ?', +videoId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!video || !video.id) {
      throw new RequestException('Video not found')
    }

    try {
      await db.query('DELETE FROM videos WHERE id = ?', +videoId)
    } catch (error) {
      throw new DBException(undefined, error)
    }

    try {
      await db.query("DELETE FROM authorizations WHERE element_type = 'video' AND element_id = ?", +videoId)
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let videos: Video[] = []

    try {
      videos = await db.query<Video[]>('SELECT * FROM videos ORDER BY date DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { videos })
  }
}

