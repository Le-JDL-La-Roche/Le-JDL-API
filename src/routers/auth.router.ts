import { NextFunction, Router } from 'express'
import { Route } from '$models/handle/route.model'
import { Request, Response } from 'express'
import { DefaultHttpResponse } from '$models/responses/http/default-http-response.model'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import Auth from '$controllers/auth.controller'
import { ControllerException } from '$models/types'

export default class AuthRouter implements Route {
  router = Router()

  constructor() {
    this.init()
  }

  private init() {
    /**
     * @openapi
     * /auth:
     *   get:
     *     tags:
     *       - Auth
     *     security:
     *       - basic: []
     *     summary: Auth the admin
     *     responses:
     *       200:
     *         description: Logged
     *       401:
     *         description: Unauthorized
     */
    this.router.get(`/auth`, async (req: Request, res: Response<DataHttpResponse<{ jwt: string }>>, next: NextFunction) => {
      try {
        const resp = await new Auth().auth(req.headers)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /verify:
     *   get:
     *     tags:
     *       - Auth
     *     security:
     *       - bearer: []
     *     summary: Verify admin JWT
     *     responses:
     *       200:
     *         description: Allowed
     *       401:
     *         description: Unauthorized
     */
    this.router.get(`/verify`, async (req: Request, res: Response<DataHttpResponse<{ jwt: string }>>, next: NextFunction) => {
      try {
        const resp = await new Auth().verify(req.headers)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /logout:
     *   delete:
     *     tags:
     *      - Auth
     *     security:
     *       - bearer: []
     *     summary: Logout the user
     *     responses:
     *       200:
     *         description: Logged out
     */
    this.router.delete(`/logout`, async (req: Request, res: Response<DefaultHttpResponse>, next: NextFunction) => {
      try {
        const resp = await new Auth().logout(req.headers)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })
  }
}
