import db from '$utils/database'
import { Event } from '$models/features/agenda.model'
import { ControllerException, SUCCESS } from '$models/types'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DataSuccess } from '$responses/success/data-success.response'
import { NextFunction } from 'express'
import { IncomingHttpHeaders } from 'http'
import nexter from '$utils/nexter'
import { AuthService } from '$services/auth.service'
import { RequestException } from '$responses/exceptions/request-exception.response'

export default class Agenda {
  async getAgenda(): Promise<DataSuccess<{ agenda: Event[] }>> {
    let agenda: Event[] = []

    try {
      agenda = await db.query<Event[]>('SELECT * FROM agenda ORDER BY date DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { agenda })
  }

  async postEvent(headers: IncomingHttpHeaders, body: Event, file: Express.Multer.File | null): Promise<DataSuccess<{ agenda: Event[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    if (!body.title || !body.content || !file || !body.date || !body.color) {
      throw new RequestException('Missing parameters')
    }

    try {
      await db.query('INSERT INTO agenda (title, content, date, color, thumbnail) VALUES (?, ?, ?, ?, ?)', [
        body.title + '',
        body.content + '',
        body.date + '',
        body.color + '',
        file.filename + ''
      ])
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let agenda: Event[] = []

    try {
      agenda = await db.query<Event[]>('SELECT * FROM agenda ORDER BY date DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { agenda })
  }

  async putEvent(
    headers: IncomingHttpHeaders,
    eventId: number,
    body: Event,
    file: Express.Multer.File | null
  ): Promise<DataSuccess<{ agenda: Event[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let event: Event

    try {
      event = (await db.query<Event[]>('SELECT * FROM agenda WHERE id = ?', +eventId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!event || !event.id) {
      throw new RequestException('Event not found')
    }

    event = {
      title: body.title ? body.title + '' : event.title,
      content: body.content ? body.content + '' : event.content,
      date: body.date ? body.date + '' : body.date,
      color: body.color ? body.color + '' : event.color,
      thumbnail: file ? file.filename + '' : event.thumbnail
    }

    try {
      await db.query('UPDATE agenda SET title = ?, content = ?, date = ?, color = ?, thumbnail = ? WHERE id = ?', [
        event.title,
        event.content,
        event.date,
        event.color,
        event.thumbnail,
        +eventId
      ])
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let agenda: Event[] = []

    try {
      agenda = await db.query<Event[]>('SELECT * FROM agenda ORDER BY date DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { agenda })
  }

  async deleteEvent(headers: IncomingHttpHeaders, eventId: number): Promise<DataSuccess<{ agenda: Event[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let event: Event

    try {
      event = (await db.query<Event[]>('SELECT * FROM agenda WHERE id = ?', +eventId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!event || !event.id) {
      throw new RequestException('Event not found')
    }

    try {
      await db.query('DELETE FROM agenda WHERE id = ?', +eventId)
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let agenda: Event[] = []

    try {
      agenda = await db.query<Event[]>('SELECT * FROM agenda ORDER BY date DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { agenda })
  }
}
