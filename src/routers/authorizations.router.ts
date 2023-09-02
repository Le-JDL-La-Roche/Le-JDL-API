import { NextFunction, Router } from 'express'
import { Route } from '$models/handle/route.model'
import { Request, Response } from 'express'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import { DefaultHttpResponse } from '$models/responses/http/default-http-response.model'
import { Authorization } from '$models/data/authorization.model'
import Authorizations from '$controllers/authorizations.controller'
import { ControllerException } from '$models/types'

export default class AuthorizationsRouter implements Route {
  router = Router()
  path = '/authorizations'

  constructor() {
    this.init()
  }

  private init() {
    /**
     * @openapi
     * /authorizations:
     *   get:
     *     tags:
     *       - Authorizations
     *     security:
     *       - bearer: []
     *     summary: Get authorizations
     *     responses:
     *       200:
     *         description: Authorizations
     */
    this.router.get(
      `${this.path}`,
      async (req: Request, res: Response<DataHttpResponse<{ authorizations: Authorization[] }>>, next: NextFunction) => {
        try {
          const resp = await new Authorizations().getAuthorizations(req.headers)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /authorizations/{authorization_id}:
     *   get:
     *     tags:
     *       - Authorizations
     *     security:
     *       - bearer: []
     *     summary: Get authorization by ID
     *     parameters:
     *       - in: path
     *         name: authorization_id
     *         required: true
     *     responses:
     *       200:
     *         description: Authorization
     */
    this.router.get(
      `${this.path}/:id`,
      async (req: Request, res: Response<DataHttpResponse<{ authorization: Authorization }>>, next: NextFunction) => {
        try {
          const resp = await new Authorizations().getAuthorization(req.headers, +req.params.id)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /authorizations:
     *   post:
     *     tags:
     *       - Authorizations
     *     security:
     *       - bearer: []
     *     summary: Post a new authorization
     *     requestBody:
     *       required: false
     *       content:
     *         application/x-www-form-urlencoded:
     *           schema:
     *             type: object
     *             properties:
     *               elementType:
     *                 type: string
     *               elementId:
     *                 type: number
     *               content:
     *                 type: string
     *     responses:
     *       200:
     *         description: Authorization posted
     */
    this.router.post(
      `${this.path}`,
      async (req: Request, res: Response<DataHttpResponse<{ authorizations: Authorization[] }>>, next: NextFunction) => {
        try {
          const resp = await new Authorizations().postAuthorization(req.headers, req.body)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /authorizations/{authorization_id}:
     *   put:
     *     tags:
     *       - Authorizations
     *     security:
     *       - bearer: []
     *     summary: Put an authorization
     *     parameters:
     *       - in: path
     *         name: authorization_id
     *         required: true
     *     requestBody:
     *       required: false
     *       content:
     *         application/x-www-form-urlencoded:
     *           schema:
     *             type: object
     *             properties:
     *               elementType:
     *                 type: string
     *               elementId:
     *                 type: number
     *               content:
     *                 type: string
     *     responses:
     *       200:
     *         description: Authorization updated
     */
    this.router.put(
      `${this.path}/:id`,
      async (req: Request, res: Response<DataHttpResponse<{ authorizations: Authorization[] }>>, next: NextFunction) => {
        try {
          const resp = await new Authorizations().putAuthorization(req.headers, +req.params.id, req.body)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /authorizations/{authorization_id}:
     *   delete:
     *     tags:
     *       - Authorizations
     *     security:
     *       - bearer: []
     *     summary: Delete an authorization
     *     parameters:
     *       - in: path
     *         name: authorization_id
     *         required: true
     *     responses:
     *       200:
     *         description: Authorization deleted
     */
    this.router.delete(
      `${this.path}/:id`,
      async (req: Request, res: Response<DataHttpResponse<{ authorizations: Authorization[] }>>, next: NextFunction) => {
        try {
          const resp = await new Authorizations().deleteAuthorization(req.headers, +req.params.id)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )
  }
}
