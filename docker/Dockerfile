FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY packageManager.json package.json
RUN corepack enable

FROM base AS build
COPY --from=root . /feathers-chat-mod
WORKDIR /feathers-chat-mod
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
WORKDIR /feathers-chat-mod
RUN pnpm run -C backend compile
RUN mkdir data
RUN pnpm run -C backend migrate
RUN pnpm run -C frontend build
RUN pnpm --filter=@rp-pedraza/feathers-chat-mod-backend --prod deploy /feathers-chat-mod.prod/backend
RUN pnpm --filter=@rp-pedraza/feathers-chat-mod-frontend --prod deploy /feathers-chat-mod.prod/frontend

FROM base AS final
COPY --from=build /feathers-chat-mod.prod /feathers-chat-mod
COPY --from=build /feathers-chat-mod/backend/config/default.json /feathers-chat-mod/backend/config/
COPY --from=build /feathers-chat-mod/data /feathers-chat-mod/data.skel
RUN mkdir /feathers-chat-mod/data
WORKDIR /feathers-chat-mod/backend
COPY entrypoint.sh /entrypoint.sh
EXPOSE 3030
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
CMD ["pnpm", "start"]
