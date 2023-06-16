import { Request, Response, NextFunction } from 'express'
import dateFormat from 'moment'
import { ControllerException } from '$models/types'
import { DefaultHttpResponse } from '$models/responses/http/default-http-response.model'
import moment from 'moment'

const middleware = (err: ControllerException, req: Request, res: Response<DefaultHttpResponse>, next: NextFunction) => {
  res.status(err.httpStatus).send({ code: err.code, message: err.message })
}

export default middleware
