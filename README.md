# feathers-chat-mod

This is a modified version of [feathers-chat](https://github.com/feathersjs/feathers-chat).

## Changes

- Simplified to two parts: the frontend and the backend
- The frontent was based on the static files stored on the public directory,
  fully converted to a new [Vue 3](https://vuejs.org/) app that was initialized from scratch.
- The backend was the feathers-chat-ts folder renamed to `backend`.
- Both frontend and backend can be run in production or development mode
- Site can be accessed through the frontend service port (5137) or the backend (3030) thus
  demonstrating consitent routing and proxying dependening on where the site is accessed and making
  the strategies for deploying the site more flexible.

## Running through Docker

For quick demonstration, this application can be immediately be run through the Docker image
uploaded in Docker Hub.

    docker run -it --rm -p 3030:3030 rppedraza/feathers-chat-mod:latest

## Requirements

- [Task](https://taskfile.dev/installation/)
- [PNPM](https://pnpm.io/installation)

## Cloning the repo

    git clone https://github.com/rp-pedraza/feathers-chat-mod.git
    cd feathers-chat-mod

In the following steps, every command has to be run in the `feathers-chat-mod` directory.

## Running the services in development mode

In this mode, the frontend also runs as a server.

Open two terminals and run the following commands separately:

    task frontend:serve
    task backend:serve

After both serves run launched successfully, the site can be visited through http://localhost:3030 (backend) or
http://localhost:5137 (frontend).

## Running the services in "production" mode

This time only one terminal is needed.  Run the following command in it:

    task backend:serve:prod

## Building a new docker image and running it

    task docker:up:build
