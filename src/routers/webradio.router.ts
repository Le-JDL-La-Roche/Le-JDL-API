import { NextFunction, Router } from 'express'
import { Route } from '$models/handle/route.model'
import { Request, Response } from 'express'
import Env from '$controllers/env.controller'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import { DefaultHttpResponse } from '$models/responses/http/default-http-response.model'
import Webradio from '$controllers/webradio.controller'

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
    this.router.get(`${this.path}/shows`, async (req: Request, res: Response<DataHttpResponse<any>>, next: NextFunction) => {
      try {
        const resp = await new Webradio().getPublishedWebradioShows(next)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error) {}
    })
  }
}
