import { NextFunction, Router } from 'express'
import { Route } from '$models/handle/route.model'
import { Request, Response } from 'express'
import Env from '$controllers/env.controller'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import { DefaultHttpResponse } from '$models/responses/http/default-http-response.model'
import Webradio from '$controllers/webradio.controller'
import { WebradioShow } from '$models/features/webradio-show.model'

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
        const resp = await new Webradio().getPublishedWebradioShows(next)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error) {}
    })

    /**
     * @openapi
     * /webradio/shows/current:
     *   get:
     *     tags:
     *       - Webradio
     *     summary: Get current shows
     *     responses:
     *       200:
     *         description: Show
     */
    this.router.get(
      `${this.path}/shows/current`,
      async (req: Request, res: Response<DataHttpResponse<{ show: WebradioShow }>>, next: NextFunction) => {
        try {
          const resp = await new Webradio().getCurrentWebradioShow(next)
          if (resp.data) {
            res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
          } else {
            res.status(resp.httpStatus).send({ code: resp.code, message: resp.message })
          }
        } catch (error) {}
      }
    )
  }
}
