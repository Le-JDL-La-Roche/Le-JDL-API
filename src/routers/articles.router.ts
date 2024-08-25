import { Route } from '$models/handle/route.model'
import { Router, NextFunction } from 'express'
import { Request, Response } from 'express'
import Articles from '$controllers/articles.controller'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import { Article } from '$models/features/article.model'
import { FilesService } from '$services/files.service'
import { ControllerException } from '$models/types'

export default class ArticlesRouter implements Route {
  router = Router()
  path = '/articles'

  constructor() {
    this.init()
  }

  private init() {
    /**
     * @openapi
     * /articles:
     *   get:
     *     tags:
     *       - Articles
     *     summary: Get published articles
     *     responses:
     *       200:
     *         description: Articles
     */
    this.router.get(`${this.path}`, async (req: Request, res: Response<DataHttpResponse<{ articles: Article[] }>>, next: NextFunction) => {
      try {
        const resp = await new Articles().getPublishedArticles()
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /articles/all:
     *   get:
     *     tags:
     *       - Articles
     *     security:
     *       - bearer: []
     *     summary: Get all articles
     *     responses:
     *       200:
     *         description: Articles
     */
    this.router.get(`${this.path}/all`, async (req: Request, res: Response<DataHttpResponse<{ articles: Article[] }>>, next: NextFunction) => {
      try {
        const resp = await new Articles().getAllArticles(req.headers)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /articles/{article_id}:
     *   get:
     *     tags:
     *       - Articles
     *     security:
     *       - bearer: []
     *     summary: Get article by ID
     *     parameters:
     *       - in: path
     *         name: article_id
     *         required: true
     *     responses:
     *       200:
     *         description: Article
     */
    this.router.get(`${this.path}/:id`, async (req: Request, res: Response<DataHttpResponse<{ article: Article }>>, next: NextFunction) => {
      try {
        const resp = await new Articles().getArticle(req.headers, +req.params.id)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /articles:
     *   post:
     *     tags:
     *       - Articles
     *     security:
     *       - bearer: []
     *     summary: Post a new article
     *     requestBody:
     *       required: false
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *               article:
     *                 type: string
     *               thumbnailSrc:
     *                 type: string
     *               category:
     *                 type: string
     *               author:
     *                 type: string
     *               date:
     *                 type: string
     *               status:
     *                 type: number
     *               thumbnail:
     *                 type: file
     *     responses:
     *       200:
     *         description: Article posted
     */
    this.router.post(
      `${this.path}`,
      new FilesService().uploadArticleThumbnail,
      async (req: Request, res: Response<DataHttpResponse<{ articles: Article[]; id: number }>>, next: NextFunction) => {
        try {
          const resp = await new Articles().postArticle(req.headers, req.body, req.file || null)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /articles/{article_id}:
     *   put:
     *     tags:
     *       - Articles
     *     security:
     *       - bearer: []
     *     summary: Put an article by ID
     *     parameters:
     *       - in: path
     *         name: article_id
     *         required: true
     *     requestBody:
     *       required: false
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *               article:
     *                 type: string
     *               thumbnailSrc:
     *                 type: string
     *               category:
     *                 type: string
     *               author:
     *                 type: string
     *               date:
     *                 type: string
     *               status:
     *                 type: number
     *               thumbnail:
     *                 type: file
     *     responses:
     *       200:
     *         description: Article updated
     */
    this.router.put(
      `${this.path}/:id`,
      new FilesService().uploadArticleThumbnail,
      async (req: Request, res: Response<DataHttpResponse<{ articles: Article[]; id: number }>>, next: NextFunction) => {
        try {
          const resp = await new Articles().putArticle(req.headers, +req.params.id, req.body, req.file || null)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /articles/{article_id}:
     *   delete:
     *     tags:
     *       - Articles
     *     security:
     *       - bearer: []
     *     summary: Delete an article by ID
     *     parameters:
     *       - in: path
     *         name: article_id
     *         required: true
     *     responses:
     *       200:
     *         description: Article deleted
     */
    this.router.delete(`${this.path}/:id`, async (req: Request, res: Response<DataHttpResponse<{ articles: Article[] }>>, next: NextFunction) => {
      try {
        const resp = await new Articles().deleteArticle(req.headers, +req.params.id)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })
  }
}

