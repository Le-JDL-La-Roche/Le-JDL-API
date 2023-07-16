import { Server, Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import db from '$utils/database'
import { IO } from '$models/handle/io.model'
import { WebradioShow } from '$models/features/webradio-show.model'
import { count } from '$models/types'
import { WebradioQuestion } from '$models/features/webradio-question.model'

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
      }
    })

    socket.on('stopLiveStream', async () => {
      let liveShowCount: count

      try {
        liveShowCount = (await db.query<count[]>('SELECT COUNT(*) as count FROM webradio_shows WHERE status = 0 ORDER BY date DESC'))[0]
      } catch (error) {
        socket.emit('error', error)
        return
      }

      if (liveShowCount.count == 0) {
        io.emit('liveStreamStopped')
      }
    })

    socket.on('question', async () => {
      let liveShow: WebradioShow

      try {
        liveShow = (await db.query<WebradioShow[]>('SELECT * FROM webradio_shows WHERE status = 0 ORDER BY date DESC'))[0]
      } catch (error) {
        socket.emit('error', error)
        return
      }

      let questions: WebradioQuestion[]

      try {
        questions = (await db.query<WebradioQuestion[]>('SELECT * FROM webradio_shows_questions WHERE show_id = ? ORDER BY date ASC', liveShow.id))
      } catch (error) {
        socket.emit('error', error)
        return
      }

      io.emit('updateQuestions', questions)
    })
  }
}
