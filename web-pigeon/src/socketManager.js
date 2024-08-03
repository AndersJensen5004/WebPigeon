// src/socketManager.js
import io from 'socket.io-client';
import config from './config';

let socket = null;

export const getSocket = (messengerId) => {
  if (!socket) {
    socket = io(config.apiBaseUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      socket.emit('join', { messenger_id: messengerId });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });
  }

  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};