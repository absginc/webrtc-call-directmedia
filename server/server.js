const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'https://privatechat.wtpn.news', methods: ['GET', 'POST'] }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(socket.id);
    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on('offer', (data) => {
    console.log(`Received offer from ${socket.id} for room ${data.roomId}`);
    socket.to(data.roomId).emit('offer', { offer: data.offer });
  });

  socket.on('answer', (data) => {
    console.log(`Received answer from ${socket.id} for room ${data.roomId}`);
    socket.to(data.roomId).emit('answer', { answer: data.answer });
  });

  socket.on('ice-candidate', (data) => {
    console.log(`Received ICE candidate from ${socket.id} for room ${data.roomId}`);
    socket.to(data.roomId).emit('ice-candidate', { candidate: data.candidate });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
      if (rooms[roomId].length === 0) delete rooms[roomId];
    }
  });
});

server.listen(3000, () => {
  console.log('Signaling server running on port 3000');
});

