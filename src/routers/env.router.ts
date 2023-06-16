import { NextFunction, Router } from 'express'
import { Route } from '$models/handle/route.model'
import { Request, Response } from 'express'
import Env from '$controllers/env.controller'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import { DefaultHttpResponse } from '$models/responses/http/default-http-response.model'

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
  }
}
