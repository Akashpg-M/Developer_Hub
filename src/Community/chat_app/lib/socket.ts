import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

const userToSocketMap: Record<string, string> = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  const userId = socket.handshake.query.userId as string;
  if (userId) {
    userToSocketMap[userId] = socket.id;
  }
  // Join community rooms
  socket.on('join-community', (communityId: string) => {
    socket.join(communityId);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const userId = Object.keys(userToSocketMap).find(key => userToSocketMap[key] === socket.id);
    if (userId) {
      delete userToSocketMap[userId];
    }
  });
});

export const getReceiverSocketId = (receiverId: string): string | undefined => {
  return userToSocketMap[receiverId];
};

export { app, server, io }; 