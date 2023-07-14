import Videos from '$controllers/videos.controller'
import { Video } from '$models/features/video.model'
import { Route } from '$models/handle/route.model'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import { FilesService } from '$services/files.service'
import { NextFunction, Router } from 'express'
import { Request, Response } from 'express'

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
     *     summary: Get published videos
     *     responses:
     *       200:
     *         description: Videos
     */
    this.router.get(`${this.path}`, async (req: Request, res: Response<DataHttpResponse<{ videos: Video[] }>>, next: NextFunction) => {
      try {
        const resp = await new Videos().getPublishedVideos(next)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error) {}
    })

    /**
     * @openapi
     * /videos/all:
     *   get:
     *     tags:
     *       - Videos
     *     security:
     *       - bearer: []
     *     summary: Get all videos
     *     responses:
     *       200:
     *         description: Videos
     */
    this.router.get(`${this.path}/all`, async (req: Request, res: Response<DataHttpResponse<{ videos: Video[] }>>, next: NextFunction) => {
      try {
        const resp = await new Videos().getAllVideos(req.headers, next)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error) {}
    })

    /**
     * @openapi
     * /videos/{video_id}:
     *   get:
     *     tags:
     *       - Videos
     *     security:
     *       - bearer: []
     *     summary: Get video by ID
     *     parameters:
     *       - in: path
     *         name: video_id
     *         required: true
     *     responses:
     *       200:
     *         description: Video
     */
    this.router.get(`${this.path}/:id`, async (req: Request, res: Response<DataHttpResponse<{ video: Video }>>, next: NextFunction) => {
      try {
        const resp = await new Videos().getVideo(req.headers, +req.params.id, next)
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
     *               author:
     *                 type: string
     *               status:
     *                 type: number
     *               thumbnail:
     *                 type: file
     *     responses:
     *       200:
     *         description: Video posted
     */
    this.router.post(
      `${this.path}`,
      new FilesService().uploadVideoThumbnail,
      async (req: Request, res: Response<DataHttpResponse<{ videos: Video[] }>>, next: NextFunction) => {
        try {
          const resp = await new Videos().postVideo(req.headers, req.body, req.file || null, next)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error) {}
      }
    )

    /**
     * @openapi
     * /videos/{video_id}:
     *   put:
     *     tags:
     *       - Videos
     *     security:
     *       - bearer: []
     *     summary: Put a video by ID
     *     parameters:
     *       - in: path
     *         name: video_id
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
     *               description:
     *                 type: string
     *               videoId:
     *                 type: string
     *               category:
     *                 type: string
     *               type:
     *                 type: string
     *               author:
     *                 type: string
     *               status:
     *                 type: number
     *               thumbnail:
     *                 type: file
     *     responses:
     *       200:
     *         description: Video updated
     */
    this.router.put(
      `${this.path}/:id`,
      new FilesService().uploadVideoThumbnail,
      async (req: Request, res: Response<DataHttpResponse<{ videos: Video[] }>>, next: NextFunction) => {
        try {
          const resp = await new Videos().putVideo(req.headers, +req.params.id, req.body, req.file || null, next)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error) {}
      }
    )

    /**
     * @openapi
     * /videos/{video_id}:
     *   delete:
     *     tags:
     *       - Videos
     *     security:
     *       - bearer: []
     *     summary: Delete a video by ID
     *     parameters:
     *       - in: path
     *         name: video_id
     *         required: true
     *     responses:
     *       200:
     *         description: Video deleted
     */
    this.router.delete(`${this.path}/:id`, async (req: Request, res: Response<DataHttpResponse<{ videos: Video[] }>>, next: NextFunction) => {
      try {
        const resp = await new Videos().deleteVideo(req.headers, +req.params.id, next)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error) {}
    })
  }
}
