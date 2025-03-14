import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import {
  koa,
  Koa,
  rest,
  bodyParser,
  errorHandler,
  parseAuthentication,
  cors,
  serveStatic
} from '@feathersjs/koa'
import socketio from '@feathersjs/socketio'
import { configurationValidator } from './configuration'
import type { Application } from './declarations'
import { logError } from './hooks/log-error'
import { sqlite } from './sqlite'
import { authentication } from './authentication'
import { services } from './services/index'
import { channels } from './channels'
import proxy from '@rp-pedraza/koa-proxy'

const app: Application = koa(feathers())

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator))

// Set up Koa middleware
app.use(cors())

// Redirect to index to respect frontend SPA
app.use(async (ctx: Koa.Context, next) => {
  if (ctx.url == '/chat' || ctx.url == '/login') {
    ctx.url = '/'
  }
  await next()
})

let proxyHost: string

if (process.env.NODE_ENV === 'development') {
  app.use(
    proxy({
      host: app.get('proxy').host,
      match(path: string) {
        return !path.match(/^\/oauth/)
      }
    })
  )
} else {
  app.use(serveStatic(app.get('public')))
}

app.use(errorHandler())
app.use(parseAuthentication())
app.use(bodyParser())

// Configure services and transports
app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: app.get('origins')
    }
  })
)
app.configure(channels)
app.configure(sqlite)
app.configure(authentication)
app.configure(services)

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError]
  },
  before: {},
  after: {},
  error: {}
})

// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: []
})

export { app }
