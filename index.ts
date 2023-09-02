import App from './src/app'
import DefaultRouter from '$routers/default.router'
import EnvRouter from '$routers/env.router'
import AuthRouter from '$routers/auth.router'
import DefaultSocket from '$sockets/default.socket'
import WebradioRouter from '$routers/webradio.router'
import VideosRouter from '$routers/video.router'
import ArticlesRouter from '$routers/articles.router'
import AuthorizationsRouter from '$routers/authorizations.router'
import AgendaRouter from '$routers/agenda.router'

new App(
  [
    new DefaultRouter(),
    new AuthRouter(),
    new EnvRouter(),
    new WebradioRouter(),
    new VideosRouter(),
    new ArticlesRouter(),
    new AgendaRouter(),
    new AuthorizationsRouter()
  ],
  [new DefaultSocket()]
).listen()
