import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import errorMiddleware from '$middlewares/error.middleware'
import notFountMiddleware from '$middlewares/not-found.middleware'
import { Route } from '$models/handle/route.model'
import { IO } from '$models/handle/io.model'
import cors from 'cors'

export default class App {
  private expressApp = express()
  private httpServer = createServer(this.expressApp)
  private ioServer = new Server(this.httpServer, { cors: { origin: '*' } })
  private port = 5000

  constructor(routers: Route[], sockets: IO[]) {
    dotenv.config()

    this.initMiddlewares()
    this.initRoutes(routers)
    this.initIOs(sockets)
    this.initErrorHandling()
  }

  listen() {
    this.httpServer.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`)
    })
  }

  private initMiddlewares() {
    this.expressApp.use(cors())
    this.expressApp.use(bodyParser.urlencoded({ extended: false }), bodyParser.json())
  }

  private initErrorHandling() {
    this.expressApp.use(notFountMiddleware, errorMiddleware)
  }

  private initRoutes(routes: Route[]) {
    this.expressApp.use('/public', express.static('public'))
    routes.forEach((route) => {
      this.expressApp.use('/', route.router)
    })
  }

  private initIOs(ios: IO[]) {
    ios.forEach((io) => {
      this.ioServer.on('connection', (socket) => io.socket(socket, this.ioServer))
    })
  }
}
