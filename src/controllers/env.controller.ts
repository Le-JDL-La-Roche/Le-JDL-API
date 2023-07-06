import db from '$utils/database'
import { SUCCESS, count } from '$models/types'
import { DataSuccess } from '$responses/success/data-success.response'
import { NextFunction } from 'express'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DefaultSuccess } from '$responses/success/default-success.response'
import nexter from '$utils/nexter'
import { AuthService } from '$services/auth.service'
import { IncomingHttpHeaders } from 'http'
import { RequestException } from '$responses/exceptions/request-exception.response'
import { Journalist } from '$models/features/journalist.model'

export default class Env {
  async getEnv(next: NextFunction): Promise<DataSuccess<{ visits: Visits; shows: Shows; videos: Videos; articles: Articles }>> {
    try {
      await this.updateDb()
    } catch (error) {
      next(error)
      throw null
    }

    let visits: Visits = { total: 0, visits: [] }
    let shows: Shows = { total: 0, status: { draft: 0, live: 0, waiting: 0, podcast: 0 } }
    let videos: Videos = {
      total: 0,
      category: { news: 0, culture: 0, sport: 0, science: 0, tech: 0, laroche: 0 },
      type: { youtube: 0, instagram: 0 }
    }
    let articles: Articles = { total: 0, category: { news: 0, culture: 0, sport: 0, science: 0, tech: 0, laroche: 0 } }

    try {
      visits.visits = await db.query('SELECT * FROM visits ORDER BY timestamp DESC')

      shows.status.draft = (await db.query<count[]>('SELECT COUNT(*) AS count FROM webradio_shows WHERE status = -1'))[0].count
      shows.status.live = (await db.query<count[]>('SELECT COUNT(*) AS count FROM webradio_shows WHERE status = 0'))[0].count
      shows.status.waiting = (await db.query<count[]>('SELECT COUNT(*) AS count FROM webradio_shows WHERE status = 1'))[0].count
      shows.status.podcast = (await db.query<count[]>('SELECT COUNT(*) AS count FROM webradio_shows WHERE status = 2'))[0].count

      videos.category.news = (await db.query<count[]>("SELECT COUNT(*) AS count FROM videos WHERE category = 'news'"))[0].count
      videos.category.culture = (await db.query<count[]>("SELECT COUNT(*) AS count FROM videos WHERE category = 'culture'"))[0].count
      videos.category.sport = (await db.query<count[]>("SELECT COUNT(*) AS count FROM videos WHERE category = 'sport'"))[0].count
      videos.category.science = (await db.query<count[]>("SELECT COUNT(*) AS count FROM videos WHERE category = 'science'"))[0].count
      videos.category.tech = (await db.query<count[]>("SELECT COUNT(*) AS count FROM videos WHERE category = 'tech'"))[0].count
      videos.category.laroche = (await db.query<count[]>("SELECT COUNT(*) AS count FROM videos WHERE category = 'laroche'"))[0].count
      videos.type.youtube = (await db.query<count[]>("SELECT COUNT(*) AS count FROM videos WHERE type = 'youtube'"))[0].count
      videos.type.instagram = (await db.query<count[]>("SELECT COUNT(*) AS count FROM videos WHERE type = 'instagram'"))[0].count

      articles.category.news = (await db.query<count[]>("SELECT COUNT(*) AS count FROM articles WHERE category = 'news'"))[0].count
      articles.category.culture = (await db.query<count[]>("SELECT COUNT(*) AS count FROM articles WHERE category = 'culture'"))[0].count
      articles.category.sport = (await db.query<count[]>("SELECT COUNT(*) AS count FROM articles WHERE category = 'sport'"))[0].count
      articles.category.science = (await db.query<count[]>("SELECT COUNT(*) AS count FROM articles WHERE category = 'science'"))[0].count
      articles.category.tech = (await db.query<count[]>("SELECT COUNT(*) AS count FROM articles WHERE category = 'tech'"))[0].count
      articles.category.laroche = (await db.query<count[]>("SELECT COUNT(*) AS count FROM articles WHERE category = 'laroche'"))[0].count
    } catch (error) {
      next(new DBException())
      throw null
    }

    if (!visits.visits[0]) {
      visits.visits.unshift({
        id: 1,
        timestamp: new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000,
        visits: 0
      })
    }

    while (visits.visits[0].timestamp - Date.now() / 1000 >= 86400) {
      let t = visits.visits[0].timestamp + 86400
      visits.visits.unshift({
        id: visits.visits[0].id + 1,
        timestamp: visits.visits[0].timestamp + 86400,
        visits: 0
      })
    }

    visits.visits.forEach((visit) => {
      visits.total += visit.visits
    })
    shows.total = shows.status.draft + shows.status.live + shows.status.waiting + shows.status.podcast
    videos.total = videos.type.youtube + videos.type.instagram
    articles.total =
      articles.category.news +
      articles.category.culture +
      articles.category.sport +
      articles.category.science +
      articles.category.tech +
      articles.category.laroche

    return new DataSuccess(200, SUCCESS, 'Success', { visits, shows, videos, articles })
  }

  async updateVisits(next: NextFunction): Promise<DefaultSuccess> {
    let visits: Visits['visits'] = []

    try {
      visits = await this.updateDb()
    } catch (error) {
      next(error)
      throw null
    }

    try {
      await db.query('UPDATE visits SET visits = ? WHERE timestamp >= ?', [
        visits[0].visits + 1,
        new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000
      ])
    } catch (error) {
      next(new DBException())
      throw null
    }

    return new DefaultSuccess(200, SUCCESS, 'Success')
  }

  async deleteAdminVisits(headers: IncomingHttpHeaders, timestamp: number, next: NextFunction): Promise<DefaultSuccess> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    let tMin = timestamp - 3600
    let tMax = timestamp + 3600

    let [visits]: Visits['visits'] = []

    try {
      visits = (await db.query<Visits['visits']>('SELECT * FROM visits WHERE timestamp >= ? AND timestamp <= ?', [tMin, tMax]))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (visits && visits.visits > 0) {
      try {
        await db.query('UPDATE visits SET visits = ? WHERE timestamp >= ? AND timestamp <= ?', [visits.visits - 1, tMin, tMax])
      } catch (error) {
        next(new DBException(undefined, error))
        throw null
      }
    }

    return new DefaultSuccess(200, SUCCESS, 'Success')
  }

  private async updateDb() {
    let visits: Visits['visits'] = []

    try {
      visits = await db.query('SELECT * FROM visits ORDER BY timestamp DESC')
    } catch (error) {
      throw new DBException(undefined, error)
    }

    if (!visits[0]) {
      visits.unshift({
        id: 1,
        timestamp: new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000,
        visits: 0
      })

      try {
        await db.query('INSERT INTO visits (timestamp, visits) VALUES (?, 0)', new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000)
      } catch (error) {
        throw new DBException(undefined, error)
      }
    }

    while (visits[0].timestamp - Date.now() / 1000 <= -86400) {
      let t = visits[0].timestamp + 86400
      visits.unshift({
        id: visits[0].id + 1,
        timestamp: t,
        visits: 0
      })

      try {
        await db.query('INSERT INTO visits (timestamp, visits) VALUES (?, 0)', t)
      } catch (error) {
        throw new DBException(undefined, error)
      }
    }

    return visits
  }

  async getJournalists(next: NextFunction): Promise<DataSuccess<{ journalists: Journalist[] }>> {
    let journalists: Journalist[] = []

    try {
      journalists = await db.query<Journalist[]>('SELECT * FROM journalists')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { journalists })
  }

  async postJournalist(headers: IncomingHttpHeaders, body: Journalist, next: NextFunction): Promise<DataSuccess<{ journalists: Journalist[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    if (!body.name || !body.class) {
      next(new RequestException('Missing parameters'))
      throw null
    }

    try {
      await db.query('INSERT INTO journalists (name, class) VALUES (?, ?)', [body.name, body.class])
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    let journalists: Journalist[] = []

    try {
      journalists = await db.query<Journalist[]>('SELECT * FROM journalists')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { journalists })
  }

  async putJournalist(
    headers: IncomingHttpHeaders,
    journalistId: number,
    body: Journalist,
    next: NextFunction
  ): Promise<DataSuccess<{ journalists: Journalist[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    let journalist: Journalist

    try {
      journalist = (await db.query<Journalist[]>('SELECT * FROM journalists WHERE id = ?', journalistId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!journalist) {
      next(new RequestException('Journalist not found'))
      throw null
    }

    try {
      await db.query('UPDATE journalists SET name = ?, class = ? WHERE id = ?', [
        body.name || journalist.name,
        body.class || journalist.class,
        journalistId
      ])
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    let journalists: Journalist[] = []

    try {
      journalists = await db.query<Journalist[]>('SELECT * FROM journalists')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { journalists })
  }

  async deleteJournalist(
    headers: IncomingHttpHeaders,
    journalistId: number,
    next: NextFunction
  ): Promise<DataSuccess<{ journalists: Journalist[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    let journalist: Journalist

    try {
      journalist = (await db.query<Journalist[]>('SELECT * FROM journalists WHERE id = ?', journalistId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!journalist) {
      next(new RequestException('Journalist not found'))
      throw null
    }

    try {
      await db.query('DELETE FROM journalists WHERE id = ?', journalistId)
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    let journalists: Journalist[] = []

    try {
      journalists = await db.query<Journalist[]>('SELECT * FROM journalists')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { journalists })
  }
}

interface Visits {
  total: number
  visits: {
    id: number
    timestamp: number
    visits: number
  }[]
}

interface Shows {
  total: number
  status: {
    draft: number
    live: number
    waiting: number
    podcast: number
  }
}

interface Videos {
  total: number
  category: {
    news: number
    culture: number
    sport: number
    science: number
    tech: number
    laroche: number
  }
  type: {
    youtube: number
    instagram: number
  }
}

interface Articles {
  total: number
  category: {
    news: number
    culture: number
    sport: number
    science: number
    tech: number
    laroche: number
  }
}
