import { Server, Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

export interface IO {
  socket: (socket: Socket, io: Server) => void
}
