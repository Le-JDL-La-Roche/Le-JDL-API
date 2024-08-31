import { Route } from '$models/handle/route.model'
import { Router, NextFunction } from 'express'
import { Request, Response } from 'express'
import Info from '$controllers/info.controller'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import { Info as Info_ } from '$models/features/info.model'
import { FilesService } from '$services/files.service'
import { ControllerException } from '$models/types'
import Ig from '$controllers/ig.controller'

export default class IgRouter implements Route {
  router = Router()
  path = '/info'

  constructor() {
    this.init()
  }

  private init() {
    this.router.get(`${this.path}/webhooks`, async (req, res, next) => {
      try {
        const resp = await new Ig().getWebhook(req.query)
        res.status(200).setHeader('Content-Type', 'text/plain').send(resp)
      } catch (error) {
        next(error)
      }
    })
  }
}

