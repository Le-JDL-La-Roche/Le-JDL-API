import db from '$utils/database'
import { SUCCESS, count } from '$models/types'
import { DataSuccess } from '$responses/success/data-success.response'
import { NextFunction } from 'express'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DefaultSuccess } from '$responses/success/default-success.response'
import { WebradioShow } from '$models/features/webradio-show.model'

class Webradio {
  async getPublishedWebradioShows(next: NextFunction): Promise<DataSuccess<{ shows: WebradioShow[] }>> {
    var webradioShows: WebradioShow[] = []

    try {
      webradioShows = await db.query('SELECT * FROM webradio_shows WHERE status = 2 ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { shows: webradioShows })
  }

  async updateVisits(next: NextFunction): Promise<DefaultSuccess> {
    return new DefaultSuccess(200, SUCCESS, 'Success')
  }
}

export default Webradio
