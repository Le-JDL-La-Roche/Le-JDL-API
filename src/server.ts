import App from './app'
import DefaultRouter from '$routers/default.router'
import EnvRouter from '$routers/env.router'
import AuthRouter from '$routers/auth.router'
import DefaultSocket from '$sockets/default.socket'

new App([new DefaultRouter(), new AuthRouter(), new EnvRouter()], [new DefaultSocket()]).listen()
