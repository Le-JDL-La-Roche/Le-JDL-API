import App from './app'
import DefaultRouter from '$routers/default.router'
import EnvRouter from '$routers/env.router'
import AuthRouter from '$routers/auth.router'
import DefaultSocket from '$sockets/default.socket'
import WebradioRouter from '$routers/webradio.router'

new App([new DefaultRouter(), new AuthRouter(), new EnvRouter(), new WebradioRouter()], [new DefaultSocket()]).listen()
