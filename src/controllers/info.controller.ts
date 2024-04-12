import db from '$utils/database'
import { Info as Info_ } from '$models/features/info.model'
import { ControllerException, SUCCESS } from '$models/types'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DataSuccess } from '$responses/success/data-success.response'
import { NextFunction } from 'express'
import { IncomingHttpHeaders } from 'http'
import nexter from '$utils/nexter'
import { AuthService } from '$services/auth.service'
import { RequestException } from '$responses/exceptions/request-exception.response'

export default class Info {
  async getInfo(headers: IncomingHttpHeaders): Promise<DataSuccess<{ info: Info_[] }>> {
    const auth = await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer')

    let info: Info_[] = []

    try {
      info = auth.status
        ? await db.query<Info_[]>('SELECT * FROM info ORDER BY id DESC')
        : await db.query<Info_[]>('SELECT * FROM info WHERE enabled = 1 ORDER BY id DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    info = info.map((i) => {
      return {
        ...i,
        enabled: i.enabled == 1
      }
    })

    return new DataSuccess(200, SUCCESS, 'Success', { info })
  }

  async postInfo(headers: IncomingHttpHeaders, body: Info_, file: Express.Multer.File | null): Promise<DataSuccess<{ info: Info_[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    if (!body.html) {
      throw new RequestException('Missing parameters')
    }

    try {
      await db.query('INSERT INTO info (html, css, enabled) VALUES (?, ?, ?)', [
        body.html + '',
        body.css + '',
        0
      ])
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let info: Info_[] = []

    try {
      info = await db.query<Info_[]>('SELECT * FROM info ORDER BY id DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { info })
  }

  async putInfo(
    headers: IncomingHttpHeaders,
    infoId: number,
    body: Info_,
    file: Express.Multer.File | null
  ): Promise<DataSuccess<{ info: Info_[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let info: Info_

    try {
      info = (await db.query<Info_[]>('SELECT * FROM info WHERE id = ?', +infoId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!info || !info.id) {
      throw new RequestException('Info not found')
    }

    info = {
      html: body.html ? body.html + '' : info.html,
      css: body.css ? body.css + '' : info.css,
      enabled: body.enabled ? true : info.enabled == 1
    }

    if (info.enabled) {
      try {
        await db.query('UPDATE info SET enabled = 0 WHERE id != ?', +infoId)
      } catch (error) {
        throw new DBException(undefined, error)
      }
    }

    try {
      await db.query('UPDATE info SET html = ?, css = ?, enabled = ? WHERE id = ?', [
        info.html,
        info.css,
        info.enabled ? 1 : 0,
        + infoId
      ])
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let info_: Info_[] = []

    try {
      info_ = await db.query<Info_[]>('SELECT * FROM info ORDER BY id DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { info: info_ })
  }

  async deleteInfo(headers: IncomingHttpHeaders, infoId: number): Promise<DataSuccess<{ info: Info_[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let info: Info_

    try {
      info = (await db.query<Info_[]>('SELECT * FROM info WHERE id = ?', +infoId))[0]
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!info || !info.id) {
      throw new RequestException('Info not found')
    }

    try {
      await db.query('DELETE FROM info WHERE id = ?', +infoId)
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let info_: Info_[] = []

    try {
      info_ = await db.query<Info_[]>('SELECT * FROM info ORDER BY id DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { info: info_ })
  }

  async putResetInfo(headers: IncomingHttpHeaders): Promise<DataSuccess<{ info: Info_[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    try {
      await db.query('UPDATE info SET enabled = 0')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    let info: Info_[] = []

    try {
      info = await db.query<Info_[]>('SELECT * FROM info ORDER BY id DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    return new DataSuccess(200, SUCCESS, 'Success', { info })
  }
}
