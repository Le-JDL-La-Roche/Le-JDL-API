import { Server, Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import db from '$utils/database'
import { IO } from '$models/handle/io.model'
import { WebradioShow } from '$models/features/webradio-show.model'

export default class DefaultSocket implements IO {
  socket(socket: Socket, io: Server) {
    socket.on('launchLiveStream', async () => {
      let liveShow: WebradioShow

      try {
        liveShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE status = 0 ORDER BY date DESC'))[0]
      } catch (error) {
        socket.emit('error', error)
        return
      }

      if (liveShow && liveShow.id) {
        io.emit('liveStreamLaunched', liveShow)
        console.log('STARTED')
      }
    })

    socket.on('stopLiveStream', async () => {
      io.emit('liveStreamStopped')
      console.log('STOPPED')
    })
  }
}
