import Videos from '$controllers/video.controller'
import { Video } from '$models/features/video.model'
import { Route } from '$models/handle/route.model'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import {FilesService} from '$services/files.service'
import { NextFunction, Router } from 'express'
import { Request, Response } from 'express'
import multer from 'multer'

export default class VideosRouter implements Route {
  router = Router()
  path = '/videos'

  constructor() {
    this.init()
  }

  private init() {
    /**
     * @openapi
     * /videos:
     *   get:
     *     tags:
     *       - Videos
     *     summary: Get videos
     *     responses:
     *       200:
     *         description: Videos
     */
    this.router.get(`${this.path}`, async (req: Request, res: Response<DataHttpResponse<{ videos: Video[] }>>, next: NextFunction) => {
      try {
        const resp = await new Videos().getVideos(next)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error) {}
    })

    /**
     * @openapi
     * /videos/{id}:
     *   get:
     *     tags:
     *       - Videos
     *     summary: Get video by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *     responses:
     *       200:
     *         description: Video
     */
    this.router.get(`${this.path}/:id`, async (req: Request, res: Response<DataHttpResponse<{ video: Video }>>, next: NextFunction) => {
      try {
        const resp = await new Videos().getVideo(+req.params.id, next)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error) {}
    })

    /**
     * @openapi
     * /videos:
     *   post:
     *     tags:
     *       - Videos
     *     security:
     *       - bearer: []
     *     summary: Post a new video
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
     *               videoId:
     *                 type: string
     *               category:
     *                 type: string
     *               type:
     *                 type: string
     *               miniature:
     *                 type: file
     *     responses:
     *       200:
     *         description: Show posted
     */
    this.router.post(
      `${this.path}`,
      new FilesService().uploadVideoMiniature,
      async (req: Request, res: Response<DataHttpResponse<{ videos: Video[] }>>, next: NextFunction) => {
        try {
          const resp = await new Videos().postVideo(req.headers, req.body, req.file || null, next)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error) {}
      }
    )
  }
}