import { Server, Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

export interface IO {
  path?: string
  socket: (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => void
}
