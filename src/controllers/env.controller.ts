import db from '$utils/database'
import { SUCCESS, count } from '$models/types'
import { DataSuccess } from '$responses/success/data-success.response'
import { NextFunction } from 'express'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DefaultSuccess } from '$responses/success/default-success.response'

export default class Env {
  async getEnv(next: NextFunction): Promise<DataSuccess<{ visits: Visits; shows: Shows; videos: Videos; articles: Articles }>> {
    var visits: Visits = { total: 0, visits: [] }
    var shows: Shows = { total: 0, status: { draft: 0, live: 0, waiting: 0, podcast: 0 } }
    var videos: Videos = {
      total: 0,
      category: { news: 0, culture: 0, sport: 0, science: 0, tech: 0, laroche: 0 },
      type: { youtube: 0, instagram: 0 }
    }
    var articles: Articles = { total: 0, category: { news: 0, culture: 0, sport: 0, science: 0, tech: 0, laroche: 0 } }

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
    var visits: Visits['visits'] = []

    try {
      visits = await db.query('SELECT * FROM visits ORDER BY timestamp DESC')
    } catch (error) {
      next(new DBException())
      throw null
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
        next(new DBException())
        console.log(error)
        throw null
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
        next(new DBException())
        console.log(error)
        throw null
      }
    }

    try {
      await db.query('UPDATE visits SET visits = ? WHERE timestamp >= ?', [
        visits[0].visits + 1,
        new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000
      ])
    } catch (error) {
      next(new DBException())
      console.log(error)
      throw null
    }

    return new DefaultSuccess(200, SUCCESS, 'Success')
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
