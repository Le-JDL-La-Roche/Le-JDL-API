import { Route } from '$models/handle/route.model'
import { Router, NextFunction } from 'express'
import { Request, Response } from 'express'
import Info from '$controllers/info.controller'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import { Info as Info_} from '$models/features/info.model'
import { FilesService } from '$services/files.service'
import { ControllerException } from '$models/types'

export default class InfoRouter implements Route {
  router = Router()
  path = '/info'

  constructor() {
    this.init()
  }

  private init() {
    /**
     * @openapi
     * /info:
     *   get:
     *     tags:
     *       - Info
     *     summary: Get info
     *     responses:
     *       200:
     *         description: Info
     */
    this.router.get(`${this.path}`, async (req: Request, res: Response<DataHttpResponse<{ info: Info_[] }>>, next: NextFunction) => {
      try {
        const resp = await new Info().getInfo(req.headers)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /info:
     *   post:
     *     tags:
     *       - Info
     *     security:
     *       - bearer: []
     *     summary: Post a new info
     *     requestBody:
     *       required: false
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               html:
     *                 type: string
     *               css:
     *                 type: string
     *     responses:
     *       200:
     *         description: Info posted
     */
    this.router.post(
      `${this.path}`,
      async (req: Request, res: Response<DataHttpResponse<{ info: Info_[] }>>, next: NextFunction) => {
        try {
          const resp = await new Info().postInfo(req.headers, req.body, req.file || null)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /info/reset:
     *   put:
     *     tags:
     *       - Info
     *     security:
     *       - bearer: []
     *     summary: Reset enabled info
     *     responses:
     *       200:
     *         description: Info reset
     */
    this.router.put(`${this.path}/reset`, async (req: Request, res: Response<DataHttpResponse<{ info: Info_[] }>>, next: NextFunction) => {
      try {
        const resp = await new Info().putResetInfo(req.headers)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })
    
    /**
     * @openapi
     * /info/{info_id}:
     *   put:
     *     tags:
     *       - Info
     *     security:
     *       - bearer: []
     *     summary: Put an info info by ID
     *     parameters:
     *       - in: path
     *         name: info_id
     *         required: true
     *     requestBody:
     *       required: false
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               html:
     *                 type: string
     *               css:
     *                 type: string
     *               enabled:
     *                 type: string
     *     responses:
     *       200:
     *         description: Info updated
     */
    this.router.put(
      `${this.path}/:id`,
      async (req: Request, res: Response<DataHttpResponse<{ info: Info_[] }>>, next: NextFunction) => {
        try {
          const resp = await new Info().putInfo(req.headers, +req.params.id, req.body, req.file || null)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /info/{info_id}:
     *   delete:
     *     tags:
     *       - Info
     *     security:
     *       - bearer: []
     *     summary: Delete an info info by ID
     *     parameters:
     *       - in: path
     *         name: info_id
     *         required: true
     *     responses:
     *       200:
     *         description: Info deleted
     */
    this.router.delete(`${this.path}/:id`, async (req: Request, res: Response<DataHttpResponse<{ info: Info_[] }>>, next: NextFunction) => {
      try {
        const resp = await new Info().deleteInfo(req.headers, +req.params.id)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })
  }
}
