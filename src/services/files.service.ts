import multer from 'multer'
import nexter from '../utils/nexter'
import { DefaultHttpResponse } from '$models/responses/http/default-http-response.model'
import { AUTH_ERROR } from '$models/types'
import { AuthService } from '$services/auth.service'
import { NextFunction } from 'express'
import { Request, Response } from 'express'
import { UnauthorizedException } from '$responses/exceptions/unauthorized-exception.response'

export class FilesService {
  //! WEBRADIO
  async uploadWebradioMiniature(req: Request, res: Response, next: NextFunction) {
    const webradio = multer.diskStorage({
      destination: (req, file, next) => {
        next(null, './public/images/posters/')
      },
      filename: (req, file, next) => {
        const uniqueSuffix = Date.now().toString(16)
        const fileExtension = file.originalname.split('.').pop()
        next(null, 'webradio' + `-${uniqueSuffix}.${fileExtension}`)
      }
    })

    const upload = multer({ storage: webradio }).single('miniature')
    const auth = nexter.serviceToException(await new AuthService().checkAuth(req.headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      res.status(401).json({ code: AUTH_ERROR, message: 'Unauthorized' })
      return
    }

    upload(req, res, async (err: any) => {
      if (err instanceof multer.MulterError) {
        console.error(1, err)
      } else if (err) {
        console.error(2, err)
      }
      next()
    })
  }

  //! VIDEO
  async uploadVideoMiniature(req: Request, res: Response, next: NextFunction) {
    const video = multer.diskStorage({
      destination: (req, file, next) => {
        next(null, './public/images/posters/')
      },
      filename: (req, file, next) => {
        const uniqueSuffix = Date.now().toString(16)
        const fileExtension = file.originalname.split('.').pop()
        next(null, 'video' + `-${uniqueSuffix}.${fileExtension}`)
      }
    })

    const upload = multer({ storage: video }).single('miniature')
    const auth = nexter.serviceToException(await new AuthService().checkAuth(req.headers['authorization'] + '', 'Bearer'))

    if (!auth.status) {
      res.status(401).json({ code: AUTH_ERROR, message: 'Unauthorized' })
      return
    }

    upload(req, res, async (err: any) => {
      if (err instanceof multer.MulterError) {
        console.error(1, err)
      } else if (err) {
        console.error(2, err)
      }
      next()
    })
  }
}
