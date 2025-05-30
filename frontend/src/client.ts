import socketioClient from "@feathersjs/socketio-client";
import { createClient } from "@rp-pedraza/feathers-chat-mod-backend";
import { io } from "socket.io-client";

const socket = io(__BACKEND_SERVER_URI__);
const client = createClient(socketioClient(socket));

export default client;
