import { Route } from '$models/handle/route.model'
import { Router, NextFunction } from 'express'
import { Request, Response } from 'express'
import Agenda from '$controllers/agenda.controller'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import { Event } from '$models/features/agenda.model'
import { FilesService } from '$services/files.service'
import { ControllerException } from '$models/types'

export default class AgendaRouter implements Route {
  router = Router()
  path = '/agenda'

  constructor() {
    this.init()
  }

  private init() {
    /**
     * @openapi
     * /agenda:
     *   get:
     *     tags:
     *       - Agenda
     *     summary: Get agenda
     *     responses:
     *       200:
     *         description: Agenda
     */
    this.router.get(`${this.path}`, async (req: Request, res: Response<DataHttpResponse<{ agenda: Event[] }>>, next: NextFunction) => {
      try {
        const resp = await new Agenda().getAgenda()
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /agenda:
     *   post:
     *     tags:
     *       - Agenda
     *     security:
     *       - bearer: []
     *     summary: Post a new event
     *     requestBody:
     *       required: false
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *               content:
     *                 type: string
     *               date:
     *                 type: string
     *               color:
     *                 type: string
     *               thumbnail:
     *                 type: file
     *     responses:
     *       200:
     *         description: Event posted
     */
    this.router.post(
      `${this.path}`,
      new FilesService().uploadAgendaThumbnail,
      async (req: Request, res: Response<DataHttpResponse<{ agenda: Event[] }>>, next: NextFunction) => {
        try {
          const resp = await new Agenda().postEvent(req.headers, req.body, req.file || null)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /articles/{event_id}:
     *   put:
     *     tags:
     *       - Agenda
     *     security:
     *       - bearer: []
     *     summary: Put an agenda event by ID
     *     parameters:
     *       - in: path
     *         name: event_id
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
     *               content:
     *                 type: string
     *               date:
     *                 type: string
     *               color:
     *                 type: string
     *               thumbnail:
     *                 type: file
     *     responses:
     *       200:
     *         description: Event updated
     */
    this.router.put(
      `${this.path}/:id`,
      new FilesService().uploadAgendaThumbnail,
      async (req: Request, res: Response<DataHttpResponse<{ agenda: Event[] }>>, next: NextFunction) => {
        try {
          const resp = await new Agenda().putEvent(req.headers, +req.params.id, req.body, req.file || null)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )

    /**
     * @openapi
     * /agenda/{event_id}:
     *   delete:
     *     tags:
     *       - Agenda
     *     security:
     *       - bearer: []
     *     summary: Delete an agenda event by ID
     *     parameters:
     *       - in: path
     *         name: event_id
     *         required: true
     *     responses:
     *       200:
     *         description: Event deleted
     */
    this.router.delete(`${this.path}/:id`, async (req: Request, res: Response<DataHttpResponse<{ agenda: Event[] }>>, next: NextFunction) => {
      try {
        const resp = await new Agenda().deleteEvent(req.headers, +req.params.id)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })
  }
}
