import configuration from "@feathersjs/configuration";
import { feathers } from "@feathersjs/feathers";
import {
  bodyParser,
  cors,
  errorHandler,
  koa,
  Koa,
  parseAuthentication,
  rest,
  serveStatic
} from "@feathersjs/koa";
import socketio from "@feathersjs/socketio";
import proxy from "@rp-pedraza/koa-proxy";

import { authentication } from "./authentication.js";
import { channels } from "./channels.js";
import { configurationValidator } from "./configuration.js";
import type { Application } from "./declarations.js";
import logError from "./hooks/log-error.js";
import { services } from "./services/index.js";
import { sqlite } from "./sqlite.js";

const app: Application = koa(feathers());

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator));

// Set up Koa middleware
app.use(cors());

// Redirect to index to respect frontend SPA
const frontendSpaPages = ["/chat", "/login", "/logout", "/signup", "/username"];
app.use(async (ctx: Koa.Context, next) => {
  if (frontendSpaPages.find((path) => ctx.url == path)) {
    ctx.url = "/";
  }
  await next();
});

if (process.env.NODE_ENV === "development") {
  app.use(
    proxy({
      host: app.get("proxy").host,
      match(path: string) {
        return !path.match(/^\/oauth/);
      }
    })
  );
} else {
  app.use(serveStatic(app.get("public")));
}

app.use(async (ctx: Koa.Context, next) => {
  if (ctx.url == "/image") {
    const userIdParam = ctx.query?.userId;
    const userId =
      typeof userIdParam === "string" && userIdParam.match("^[0-9]+$")
        ? parseInt(userIdParam)
        : NaN;

    if (Number.isNaN(userId)) {
      throw new Error("User ID not provided or invalid");
    }

    const query = { userId };
    const result = await app.service("local-avatars").find({ query });
    const [avatar = null] = result.data;

    if (avatar) {
      ctx.response.body = avatar.data;
      ctx.response.type = avatar.mimeType;
      ctx.response.status = 200;
    } else {
      ctx.response.status = 404;
    }
  }

  await next();
});

app.use(errorHandler());
app.use(parseAuthentication());
app.use(bodyParser());

// Configure services and transports
app.configure(rest());
app.configure(
  socketio({
    cors: {
      origin: app.get("origins")
    }
  })
);
app.configure(channels);
app.configure(sqlite);
app.configure(authentication);
app.configure(services);

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError]
  },
  before: {},
  after: {},
  error: {}
});

// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: []
});

export { app };
