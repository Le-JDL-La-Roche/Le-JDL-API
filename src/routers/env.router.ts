import { NextFunction, Router } from 'express'
import { Route } from '$models/handle/route.model'
import { Request, Response } from 'express'
import Env from '$controllers/env.controller'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import { DefaultHttpResponse } from '$models/responses/http/default-http-response.model'
import { Journalist } from '$models/data/journalist.model'

export default class EnvRouter implements Route {
  router = Router()

  constructor() {
    this.init()
  }

  private init() {
    /**
     * @openapi
     * /env:
     *   get:
     *     tags:
     *       - Environnement
     *     summary: Get environnement
     *     responses:
     *       200:
     *         description: Environnement
     */
    this.router.get('/env', async (req: Request, res: Response<DataHttpResponse<any>>, next: NextFunction) => {
      try {
        const resp = await new Env().getEnv(next)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error) {}
    })

    /**
     * @openapi
     * /visits:
     *   put:
     *     tags:
     *       - Environnement
     *     summary: Update visits
     *     responses:
     *       200:
     *         description: Environnement
     */
    this.router.put('/visits', async (req: Request, res: Response<DefaultHttpResponse>, next: NextFunction) => {
      try {
        const resp = await new Env().updateVisits(next)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message })
      } catch (error) {}
    })

    /**
     * @openapi
     * /visits/{timestamp}:
     *   delete:
     *     tags:
     *       - Environnement
     *     security:
     *       - bearer: []
     *     summary: Remove admin visits
     *     parameters:
     *       - in: path
     *         name: timestamp
     *         required: true
     *     responses:
     *       200:
     *         description: Visits deleted
     */
    this.router.delete('/visits/:timestamp', async (req: Request, res: Response<DefaultHttpResponse>, next: NextFunction) => {
      try {
        const resp = await new Env().deleteAdminVisits(req.headers, +req.params.timestamp, next)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message })
      } catch (error) {}
    })

    /**
     * @openapi
     * /journalists:
     *   get:
     *     tags:
     *       - Environnement
     *     summary: Get journalists
     *     responses:
     *       200:
     *         description: Journalists
     */
    this.router.get('/journalists', async (req: Request, res: Response<DataHttpResponse<{ journalists: Journalist[] }>>, next: NextFunction) => {
      try {
        const resp = await new Env().getJournalists(next)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error) {}
    })

    /**
     * @openapi
     * /journalists:
     *   post:
     *     tags:
     *       - Environnement
     *     security:
     *       - bearer: []
     *     summary: Post journalist
     *     requestBody:
     *       required: false
     *       content:
     *         application/x-www-form-urlencoded:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               class:
     *                 type: string
     *     responses:
     *       200:
     *         description: Journalist posted
     */
    this.router.post('/journalists', async (req: Request, res: Response<DataHttpResponse<{ journalists: Journalist[] }>>, next: NextFunction) => {
      try {
        const resp = await new Env().postJournalist(req.headers, req.body, next)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error) {}
    })

    /**
     * @openapi
     * /journalists/{journalist_id}:
     *   put:
     *     tags:
     *       - Environnement
     *     security:
     *       - bearer: []
     *     summary: Put a journalist by ID
     *     parameters:
     *       - in: path
     *         name: journalist_id
     *         required: true
     *     requestBody:
     *       required: false
     *       content:
     *         application/x-www-form-urlencoded:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               class:
     *                 type: string
     *     responses:
     *       200:
     *         description: Journalist updated
     */
    this.router.put(
      '/journalists/:journalist_id',
      async (req: Request, res: Response<DataHttpResponse<{ journalists: Journalist[] }>>, next: NextFunction) => {
        try {
          const resp = await new Env().putJournalist(req.headers, +req.params.journalist_id, req.body, next)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error) {}
      }
    )

    /**
     * @openapi
     * /journalists/{journalist_id}:
     *   delete:
     *     tags:
     *       - Environnement
     *     security:
     *       - bearer: []
     *     summary: Delete a journalist by ID
     *     parameters:
     *       - in: path
     *         name: journalist_id
     *         required: true
     *     responses:
     *       200:
     *         description: Journalist deleted
     */
    this.router.delete(
      '/journalists/:journalist_id',
      async (req: Request, res: Response<DataHttpResponse<{ journalists: Journalist[] }>>, next: NextFunction) => {
        try {
          const resp = await new Env().deleteJournalist(req.headers, +req.params.journalist_id, next)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error) {}
      }
    )
  }
}
