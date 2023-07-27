import { NextFunction } from 'express'
import db from '$utils/database'
import { DBException } from '$responses/exceptions/db-exception.response'
import { SUCCESS } from '$models/types'
import { DataSuccess } from '$responses/success/data-success.response'
import { RequestException } from '$responses/exceptions/request-exception.response'
import { IncomingHttpHeaders } from 'http'
import nexter from '$utils/nexter'
import { AuthService } from '$services/auth.service'
import { Article } from '$models/features/article.model'

export default class Articles {
  private readonly cat = ['news', 'culture', 'sport', 'science', 'tech', 'laroche']

  async getPublishedArticles(next: NextFunction): Promise<DataSuccess<{ articles: Article[] }>> {
    let articles: Article[] = []

    try {
      articles = await db.query<Article[]>('SELECT * FROM articles WHERE status = 2 ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { articles })
  }

  async getAllArticles(headers: IncomingHttpHeaders, next: NextFunction): Promise<DataSuccess<{ articles: Article[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    let articles: Article[] = []

    try {
      articles = await db.query<Article[]>('SELECT * FROM articles ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { articles })
  }

  async getArticle(headers: IncomingHttpHeaders, articleId: number, next: NextFunction): Promise<DataSuccess<{ article: Article }>> {
    let article: Article

    try {
      article = (await db.query<Article[]>('SELECT * FROM articles WHERE id = ?', +articleId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!article || !article.id) {
      next(new RequestException('Article not found'))
      throw null
    }

    try {
      await db.query('UPDATE articles SET views = ? WHERE id = ?', [article.views! + 1, +articleId])
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (article.status == -1) {
      const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

      if (!auth.status) {
        next(auth.exception)
        throw null
      }
    }

    return new DataSuccess(200, SUCCESS, 'Success', { article })
  }

  async postArticle(
    headers: IncomingHttpHeaders,
    body: Article,
    file: Express.Multer.File | null,
    next: NextFunction
  ): Promise<DataSuccess<{ articles: Article[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    if (!body.title || !body.article || !file || !body.thumbnailSrc || !body.category || !body.author || !body.status) {
      next(new RequestException('Missing parameters'))
      throw null
    }

    if (!this.cat.includes(body.category)) {
      next(new RequestException('Invalid parameters'))
      throw null
    }

    if (+body.status != -1 && +body.status != 2) {
      next(new RequestException('Invalid parameters'))
      throw null
    }

    try {
      await db.query(
        'INSERT INTO articles (title, article, thumbnail, thumbnail_src, category, author, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          body.title + '',
          body.article + '',
          file.filename + '',
          body.thumbnailSrc + '',
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

    let articles: Article[] = []

    try {
      articles = await db.query<Article[]>('SELECT * FROM articles ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { articles })
  }

  async putArticle(
    headers: IncomingHttpHeaders,
    articleId: number,
    body: Article,
    file: Express.Multer.File | null,
    next: NextFunction
  ): Promise<DataSuccess<{ articles: Article[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    let article: Article

    try {
      article = (await db.query<Article[]>('SELECT * FROM articles WHERE id = ?', +articleId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!article || !article.id) {
      next(new RequestException('Article not found'))
      throw null
    }

    if (body.category != null && body.category != '' && !this.cat.includes(body.category)) {
      next(new RequestException('Invalid parameters'))
      throw null
    }

    if (body.status != null && body.status != undefined && +body.status != -1 && +body.status != 2) {
      next(new RequestException('Invalid parameters'))
      throw null
    }

    console.log(+article.status, +body.status)

    article = {
      title: body.title ? body.title + '' : article.title,
      article: body.article ? body.article + '' : article.article,
      thumbnail: file ? file.filename + '' : article.thumbnail,
      thumbnailSrc: body.thumbnailSrc ? body.thumbnailSrc + '' : article.thumbnailSrc,
      category: body.category ? body.category : article.category,
      author: body.author ? body.author + '' : article.author,
      date: +article.status === -1 && +body.status === 2 ? Math.round(Date.now() / 1000) + '' : article.date,
      status: body.status ? body.status : article.status
    }

    try {
      await db.query(
        'UPDATE articles SET title = ?, article = ?, thumbnail = ?, thumbnail_src = ?, category = ?, author = ?, date = ?, status = ? WHERE id = ?',
        [article.title, article.article, article.thumbnail, article.thumbnailSrc, article.category, article.author, article.date, article.status, articleId]
      )
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    let articles: Article[] = []

    try {
      articles = await db.query<Article[]>('SELECT * FROM articles ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { articles })
  }

  async deleteArticle(headers: IncomingHttpHeaders, articleId: number, next: NextFunction): Promise<DataSuccess<{ articles: Article[] }>> {
    const auth = nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      next(auth.exception)
      throw null
    }

    let article: Article

    try {
      article = (await db.query<Article[]>('SELECT * FROM articles WHERE id = ?', +articleId))[0]
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    if (!article || !article.id) {
      next(new RequestException('Article not found'))
      throw null
    }

    try {
      await db.query('DELETE FROM articles WHERE id = ?', +articleId)
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    let articles: Article[] = []

    try {
      articles = await db.query<Article[]>('SELECT * FROM articles ORDER BY date DESC')
    } catch (error) {
      next(new DBException(undefined, error))
      throw null
    }

    return new DataSuccess(200, SUCCESS, 'Success', { articles })
  }
}
