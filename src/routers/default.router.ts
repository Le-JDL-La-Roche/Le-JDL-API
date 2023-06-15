import { Router } from 'express'
import { Route } from '$models/handle/route.model'
import bodyParser from 'body-parser'
import swaggerUi from 'swagger-ui-express'
import swagger from '../../swagger/swagger'

export default class DefaultRouter implements Route {
  router = Router()

  private bodyParser = bodyParser

  constructor() {
    this.init()
  }

  private init() {
    this.router.get(`/`, (req, res) => {
      this.bodyParser.text({ type: 'text/html' })
      res.send(`<h1>Le JDL API</h1>`)
    })

    this.router.get(`/api/swagger.json`, (req, res) => {
      res.send(swagger)
    })

    this.router.use(`/swagger`, swaggerUi.serve, swaggerUi.setup(swagger, {}))
  }
}
