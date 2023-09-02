import { NextFunction, Router } from 'express'
import { Route } from '$models/handle/route.model'
import { Request, Response } from 'express'
import Env from '$controllers/env.controller'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import { DefaultHttpResponse } from '$models/responses/http/default-http-response.model'
import Webradio from '$controllers/webradio.controller'
import { WebradioShow } from '$models/features/webradio-show.model'
import multer from 'multer'
import { FilesService } from '$services/files.service'
import nexter from '$utils/nexter'
import { AuthService } from '$services/auth.service'
import { AUTH_ERROR, CLIENT_ERROR, ControllerException } from '$models/types'
import { WebradioQuestion } from '$models/features/webradio-question.model'

export default class WebradioRouter implements Route {
  router = Router()
  path = '/webradio'

  constructor() {
    this.init()
  }

  private init() {
    /**
     * @openapi
     * /webradio/shows:
     *   get:
     *     tags:
     *       - Webradio
     *     summary: Get published shows
     *     responses:
     *       200:
     *         description: Shows
     */
    this.router.get(`${this.path}/shows`, async (req: Request, res: Response<DataHttpResponse<{ shows: WebradioShow[] }>>, next: NextFunction) => {
      try {
        const resp = await new Webradio().getPublishedWebradioShows()
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /webradio/shows/current:
     *   get:
     *     tags:
     *       - Webradio
     *     summary: Get current show
     *     responses:
     *       200:
     *         description: Show
     */
    this.router.get(
      `${this.path}/shows/current`,
      async (req: Request, res: Response<DataHttpResponse<{ show: WebradioShow }>>, next: NextFunction) => {
        try {
          const resp = await new Webradio().getCurrentWebradioShow()
          if (resp.data) {
            res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
          } else {
            res.status(resp.httpStatus).send({ code: resp.code, message: resp.message })
          }
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /webradio/shows/all:
     *   get:
     *     tags:
     *       - Webradio
     *     security:
     *       - bearer: []
     *     summary: Get all shows
     *     responses:
     *       200:
     *         description: Shows
     */
    this.router.get(
      `${this.path}/shows/all`,
      async (req: Request, res: Response<DataHttpResponse<{ shows: WebradioShow[] }>>, next: NextFunction) => {
        try {
          const resp = await new Webradio().getAllWebradioShows(req.headers)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /webradio/shows/{show_id}:
     *   get:
     *     tags:
     *       - Webradio
     *     parameters:
     *       - in: path
     *         name: show_id
     *         required: true
     *     security:
     *       - bearer: []
     *     summary: Get one show by ID
     *     responses:
     *       200:
     *         description: Shows
     */
    this.router.get(`${this.path}/shows/:id`, async (req: Request, res: Response<DataHttpResponse<{ show: WebradioShow }>>, next: NextFunction) => {
      try {
        const resp = await new Webradio().getWebradioShow(req.headers, +req.params.id)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /webradio/shows:
     *   post:
     *     tags:
     *       - Webradio
     *     security:
     *       - bearer: []
     *     summary: Post a new show
     *     requestBody:
     *       required: false
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *               description:
     *                 type: string
     *               streamId:
     *                 type: string
     *               podcastId:
     *                 type: string
     *               status:
     *                 type: integer
     *               date:
     *                 type: string
     *               thumbnail:
     *                 type: file
     *     responses:
     *       200:
     *         description: Show posted
     */
    this.router.post(
      `${this.path}/shows`,
      new FilesService().uploadWebradioThumbnail,
      async (req: Request<any>, res: Response<DataHttpResponse<{ shows: WebradioShow[] }>>, next: NextFunction) => {
        try {
          const resp = await new Webradio().postWebradioShow(req.headers, req.body, req.file || null)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /webradio/shows/{show_id}:
     *   put:
     *     tags:
     *       - Webradio
     *     security:
     *       - bearer: []
     *     summary: Put a show by ID
     *     parameters:
     *       - in: path
     *         name: show_id
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
     *               description:
     *                 type: string
     *               streamId:
     *                 type: string
     *               podcastId:
     *                 type: string
     *               status:
     *                 type: integer
     *               date:
     *                 type: string
     *               thumbnail:
     *                 type: file
     *     responses:
     *       200:
     *         description: Show updated
     */
    this.router.put(
      `${this.path}/shows/:id`,
      new FilesService().uploadWebradioThumbnail,
      async (req: Request, res: Response<DataHttpResponse<{ shows: WebradioShow[] }>>, next: NextFunction) => {
        try {
          const resp = await new Webradio().putWebradioShow(req.headers, +req.params.id, req.body, req.file || null)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /webradio/shows/{show_id}:
     *   delete:
     *     tags:
     *       - Webradio
     *     security:
     *       - bearer: []
     *     summary: Delete a show by ID
     *     parameters:
     *       - in: path
     *         name: show_id
     *         required: true
     *     responses:
     *       200:
     *         description: Show deleted
     */
    this.router.delete(
      `${this.path}/shows/:id`,
      async (req: Request, res: Response<DataHttpResponse<{ shows: WebradioShow[] }>>, next: NextFunction) => {
        try {
          const resp = await new Webradio().deleteWebradioShow(req.headers, +req.params.id)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /webradio/questions/current:
     *   get:
     *     tags:
     *       - Webradio
     *     summary: Get current show questions
     *     responses:
     *       200:
     *         description: Questions
     */
    this.router.get(
      `${this.path}/questions/current`,
      async (req: Request, res: Response<DataHttpResponse<{ questions: WebradioQuestion[] }>>, next: NextFunction) => {
        try {
          const resp = await new Webradio().getCurrentShowQuestions()
          if (resp.data) {
            res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
          } else {
            res.status(resp.httpStatus).send({ code: resp.code, message: resp.message })
          }
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /webradio/questions:
     *   post:
     *     tags:
     *       - Webradio
     *     summary: Post a question
     *     requestBody:
     *       required: false
     *       content:
     *         application/x-www-form-urlencoded:
     *           schema:
     *             type: object
     *             properties:
     *               question:
     *                 type: string
     *     responses:
     *       200:
     *         description: Question posted
     */
    this.router.post(
      `${this.path}/questions`,
      async (req: Request, res: Response<DataHttpResponse<{ questions: WebradioQuestion[] }>>, next: NextFunction) => {
        try {
          const resp = await new Webradio().postQuestion(req.body)
          if (resp.data) {
            res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
          } else {
            res.status(resp.httpStatus).send({ code: resp.code, message: resp.message })
          }
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /webradio/questions/{question_id}:
     *   delete:
     *     tags:
     *       - Webradio
     *     security:
     *       - bearer: []
     *     summary: Delete question by ID
     *     parameters:
     *       - in: path
     *         name: question_id
     *         required: true
     *     responses:
     *       200:
     *         description: Question deleted
     */
    this.router.delete(
      `${this.path}/questions/:id`,
      async (req: Request, res: Response<DataHttpResponse<{ questions: WebradioQuestion[] }>>, next: NextFunction) => {
        try {
          const resp = await new Webradio().deleteQuestion(req.headers, +req.params.id)
          if (resp.data) {
            res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
          } else {
            res.status(resp.httpStatus).send({ code: resp.code, message: resp.message })
          }
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )
  }
}
