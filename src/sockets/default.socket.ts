import { Server, Socket } from 'socket.io'
import { Route } from '$models/handle/route.model'
import bodyParser from 'body-parser'
import swaggerUi from 'swagger-ui-express'
import swagger from '../../swagger/swagger'
import { IO } from '$models/handle/io.model'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

export default class DefaultSocket {
  socket(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    
  }
}
