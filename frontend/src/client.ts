import { createClient, type ClientApplication } from '@rp-pedraza/feathers-chat-mod-backend'
import socketioClient from '@feathersjs/socketio-client'
import { io } from 'socket.io-client'

const backendServerUri = __BACKEND_SERVER_URI__
console.log('backendServerUri', backendServerUri)
const socket = io(backendServerUri)
const client: ClientApplication = createClient(socketioClient(socket))

export default client
