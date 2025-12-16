import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { subClient, redisClient, initRedis } from "./services/redis.service.js";
import { SessionService } from "./services/session.service.js";
import { manageInvites } from "./room/index.js";
import type { Io } from "./types.js"
import * as dotenv from 'dotenv'

dotenv.config()

function safeLog(label: string, ...data: any[]) {
  const replacer = (key: string, value: any) => {
    if (["sessionid", "token", "password"].includes(key.toLowerCase())) {
      return "***";
    }
    return value;
  };
  try {
    const sanitized = data.map((d) => JSON.parse(JSON.stringify(d, replacer)));
    console.log(label, ...sanitized);
  } catch (err) {
    console.log(label, ...data);
  }
}

const DEBUG_SOCKET = process.env.DEBUG_SOCKET === "true";
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
app.use(cors());

const io: Io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Initialize Redis and Adapter
initRedis().then(() => {
  io.adapter(createAdapter(redisClient, subClient));
});

// Middleware for session management
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (token) {
    const session = await SessionService.getSession(token);

    if (session) {
      // Attach new socketId
      if (!session.sockets.includes(socket.id)) {
        session.sockets.push(socket.id);
        await redisClient.setex(`session:${token}`, 4 * 60 * 60, JSON.stringify(session));
      }

      socket.data.sessionID = token;
      socket.data.userID = session.userId;
      socket.data.username = session.username;

      await SessionService.refreshSession(token);
      return next();
    }
  }

  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }

  const { session, token: newToken } = await SessionService.createSession(username, socket.id);

  socket.data.sessionID = newToken;
  socket.data.userID = session.userId;
  socket.data.username = session.username;

  next();
});

io.on("connection", (socket) => {
  if (DEBUG_SOCKET) {
    socket.onAny((event, ...args) => {
      safeLog(`[Server IN] [${socket.id}] ${event}`, ...args);
    });

    const originalEmit = socket.emit;
    socket.emit = function (event: string, ...args: any[]) {
      safeLog(`[Server OUT] [${socket.id}] ${event}`, ...args);
      return (originalEmit as any).call(this, event, ...args);
    };
  }
  socket.emit("session", {
    sessionID: socket.data.sessionID!,
    userID: socket.data.userID!,
    username: socket.data.username!,
  });

  socket.join(socket.data.userID!);

  manageInvites(socket, io);

  socket.on("disconnect", async () => {
    const token = socket.data.sessionID;
    if (!token) return;

    const session = await SessionService.getSession(token);
    if (!session) return;

    // Remove this socketId from session
    session.sockets = session.sockets.filter(id => id !== socket.id);

    if (session.sockets.length === 0) {
      await redisClient.setex(`session:${token}`, 4 * 60 * 60, JSON.stringify(session));

      socket.broadcast.emit("user_disconnected", socket.data.userID!);
    } else {
      await redisClient.setex(`session:${token}`, 4 * 60 * 60, JSON.stringify(session));
    }
  });
});

server.listen(port, () => {
  console.log("listening on *:", port);
});
