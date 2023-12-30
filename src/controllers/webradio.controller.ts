import db from '$utils/database'
import { ControllerException, SUCCESS } from '$models/types'
import { DataSuccess } from '$responses/success/data-success.response'
import { NextFunction } from 'express'
import { DBException } from '$responses/exceptions/db-exception.response'
import { WebradioShow } from '$models/features/webradio-show.model'
import { IncomingHttpHeaders } from 'http'
import nexter from '$utils/nexter'
import { AuthService } from '$services/auth.service'
import { RequestException } from '$responses/exceptions/request-exception.response'
import { WebradioQuestion } from '$models/features/webradio-question.model'
import { WebradioPrompter } from '$models/features/webradio-prompter.model'
import { ResultSetHeader } from 'mysql2/promise'

export default class Webradio {
  async getPublishedWebradioShows(): Promise<DataSuccess<{ shows: WebradioShow[] }>> {
    let webradioShows: WebradioShow[] = []

    try {
      webradioShows = await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE status = 2 ORDER BY date DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { shows: webradioShows })
  }

  async getCurrentWebradioShow(): Promise<DataSuccess<{ show: WebradioShow } | null>> {
    let webradioShow: WebradioShow

    try {
      webradioShow = (
        await db.query<WebradioShow[]>(
          'SELECT * FROM webradio_shows WHERE status = -1 OR status = 0 OR status = -1.5 OR status = 0.5 ORDER BY date DESC'
        )
      )[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (webradioShow && webradioShow.id) {
      return new DataSuccess(200, SUCCESS, 'Success', { show: webradioShow })
    } else {
      return new DataSuccess(200, SUCCESS, 'No show', null)
    }
  }

  async getAllWebradioShows(headers: IncomingHttpHeaders): Promise<DataSuccess<{ shows: WebradioShow[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let webradioShows: WebradioShow[] = []

    try {
      webradioShows = await db.query<WebradioShow[]>('SELECT * FROM webradio_shows ORDER BY date DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { shows: webradioShows })
  }

  async getWebradioShow(headers: IncomingHttpHeaders, showId: number): Promise<DataSuccess<{ show: WebradioShow }>> {
    let webradioShow: WebradioShow

    try {
      webradioShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE id = ?', +showId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!webradioShow || !webradioShow.id) {
      throw new RequestException('Show not found')
    }

    if (webradioShow.status != -1 && webradioShow.status != 0 && webradioShow.status != 2) {
      try {
        nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
      } catch (error: unknown) {
        throw error as ControllerException
      }
    }

    return new DataSuccess(200, SUCCESS, 'Success', { show: webradioShow })
  }

  async postWebradioShow(
    headers: IncomingHttpHeaders,
    body: WebradioShow & { prompter?: string },
    file: Express.Multer.File | null
  ): Promise<DataSuccess<{ shows: WebradioShow[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    if (!body.title || !body.description || !file || !body.streamId || !body.date || !body.status) {
      throw new RequestException('Missing parameters')
    }

    if (
      +body.status != -2 &&
      +body.status != -2.5 &&
      +body.status != -1 &&
      +body.status != -1.5 &&
      +body.status != 0 &&
      +body.status != 0.5 &&
      +body.status != 1 &&
      +body.status != 2
    ) {
      throw new RequestException('Invalid parameters')
    }

    let liveShow: WebradioShow

    try {
      liveShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE status = -1 OR status = 0 OR status = -1.5 OR status = 0.5'))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (liveShow && liveShow.id && (+body.status != -1 || +body.status == 0 || +body.status == -1.5 || +body.status == 0.5)) {
      throw new RequestException('A show is already live')
    }

    let webradioShowInsert: ResultSetHeader

    try {
      webradioShowInsert = await db.query(
        'INSERT INTO webradio_shows (title, description, thumbnail, stream_id, podcast_id, date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [body.title + '', body.description + '', file.filename + '', body.streamId + '', body.podcastId + '', body.date + '', +body.status]
      )
    } catch (error) {
      throw new DBException(undefined, error)
    }


    try {
      await db.query('INSERT INTO webradio_shows_prompters (show_id, prompter) VALUES (?, ?)', [webradioShowInsert.insertId!, body.prompter || ''])
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let webradioShows: WebradioShow[] = []

    try {
      webradioShows = await db.query<WebradioShow[]>('SELECT * FROM webradio_shows ORDER BY date DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { shows: webradioShows })
  }

  async putWebradioShow(
    headers: IncomingHttpHeaders,
    showId: number,
    body: WebradioShow,
    file: Express.Multer.File | null
  ): Promise<DataSuccess<{ shows: WebradioShow[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let webradioShow: WebradioShow

    try {
      webradioShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE id = ?', +showId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!webradioShow || !webradioShow.id) {
      throw new RequestException('Show not found')
    }

    if (
      body.status != null &&
      body.status != undefined &&
      +body.status != -2 &&
      +body.status != -2.5 &&
      +body.status != -1 &&
      +body.status != -1.5 &&
      +body.status != 0 &&
      +body.status != 0.5 &&
      +body.status != 1 &&
      +body.status != 2
    ) {
      throw new RequestException('Invalid parameters')
    }

    let liveShow: WebradioShow

    try {
      liveShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE status = -1 OR status = 0 OR status = -1.5 OR status = 0.5'))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (
      liveShow &&
      liveShow.id &&
      liveShow.id != webradioShow.id &&
      (+body.status == -1 || +body.status == 0 || +body.status == -1.5 || +body.status == 0.5)
    ) {
      throw new RequestException('A show is already live')
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
      throw new DBException(undefined, error)
    }

    let webradioShows: WebradioShow[] = []

    try {
      webradioShows = await db.query<WebradioShow[]>('SELECT * FROM webradio_shows ORDER BY date DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { shows: webradioShows })
  }

  async deleteWebradioShow(headers: IncomingHttpHeaders, showId: number): Promise<DataSuccess<{ shows: WebradioShow[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let webradioShow: WebradioShow

    try {
      webradioShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE id = ?', +showId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!webradioShow || !webradioShow.id) {
      throw new RequestException('Show not found')
    }

    try {
      await db.query('DELETE FROM webradio_shows WHERE id = ?', +showId)
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let webradioShows: WebradioShow[] = []

    try {
      webradioShows = await db.query<WebradioShow[]>('SELECT * FROM webradio_shows ORDER BY date DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { shows: webradioShows })
  }

  async getPrompter(headers: IncomingHttpHeaders, showId: number): Promise<DataSuccess<WebradioShow & { prompter: string }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let webradioShow: WebradioShow
    let webradioShowPrompter: WebradioPrompter

    try {
      webradioShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE id = ?', +showId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    try {
      webradioShowPrompter = (await db.query<WebradioPrompter[]>('SELECT * FROM webradio_shows_prompters WHERE show_id = ?', +showId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!webradioShow || !webradioShow.id || !webradioShowPrompter || !webradioShowPrompter.id) {
      throw new RequestException('Prompter not found')
    }

    return new DataSuccess(200, SUCCESS, 'Success', {...webradioShow, prompter: webradioShowPrompter.prompter })
  }

  async putPrompter(headers: IncomingHttpHeaders, showId: number, body: { prompter: string }): Promise<DataSuccess<WebradioShow & { prompter: string }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let webradioShow: WebradioShow
    let webradioShowPrompter: WebradioPrompter

    try {
      webradioShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE id = ?', +showId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    try {
      webradioShowPrompter = (await db.query<WebradioPrompter[]>('SELECT * FROM webradio_shows_prompters WHERE show_id = ?', +showId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!webradioShow || !webradioShow.id || !webradioShowPrompter || !webradioShowPrompter.id) {
      throw new RequestException('Prompter not found')
    }

    try {
      await db.query('UPDATE webradio_shows_prompters SET prompter = ? WHERE show_id = ?', [body.prompter, +showId])
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', {...webradioShow, prompter: body.prompter })
  }

  async getCurrentShowQuestions(): Promise<DataSuccess<{ questions: WebradioQuestion[] }>> {
    let webradioShow: WebradioShow

    try {
      webradioShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE status = -1 OR status = 0'))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!webradioShow || !webradioShow.id) {
      return new DataSuccess(200, SUCCESS, 'No show', { questions: [] })
    }

    let webradioShowQuestions: WebradioQuestion[] = []

    try {
      webradioShowQuestions = await db.query<WebradioQuestion[]>('SELECT * FROM webradio_shows_questions WHERE show_id = ?', +webradioShow.id)
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { questions: webradioShowQuestions })
  }

  async postQuestion(body: WebradioQuestion): Promise<DataSuccess<{ questions: WebradioQuestion[] }>> {
    if (!body.question || !body.question.replace(/\s/g, '').length) {
      throw new RequestException('Invalid parameters')
    }

    body.question = body.question.trim()

    let webradioShow: WebradioShow

    try {
      webradioShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE status = -1 OR status = 0'))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!webradioShow || !webradioShow.id) {
      return new DataSuccess(200, SUCCESS, 'No show', { questions: [] })
    }

    try {
      await db.query('INSERT INTO webradio_shows_questions (show_id, question, date) VALUES (?, ?, ?)', [
        +webradioShow.id,
        body.question,
        Math.round(Date.now() / 1000)
      ])
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let webradioShowQuestions: WebradioQuestion[] = []

    try {
      webradioShowQuestions = await db.query<WebradioQuestion[]>('SELECT * FROM webradio_shows_questions WHERE show_id = ?', +webradioShow.id)
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { questions: webradioShowQuestions })
  }

  async deleteQuestion(headers: IncomingHttpHeaders, questionId: number): Promise<DataSuccess<{ questions: WebradioQuestion[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    try {
      await db.query('DELETE FROM webradio_shows_questions WHERE id = ?', +questionId)
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let webradioShowQuestions: WebradioQuestion[] = []

    try {
      webradioShowQuestions = await db.query<WebradioQuestion[]>('SELECT * FROM webradio_shows_questions WHERE id = ?', questionId)
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { questions: webradioShowQuestions })
  }
}
