import io from 'socket.io-client';
import config from './config';

const sockets = {};

export const getSocket = (messengerId) => {
  if (!sockets[messengerId]) {
    sockets[messengerId] = io(config.apiBaseUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      query: { messengerId }
    });

    sockets[messengerId].on('connect', () => {
      console.log(`Connected to Socket.IO server for messenger ${messengerId}`);
      sockets[messengerId].emit('join', { messenger_id: messengerId });
    });

    sockets[messengerId].on('disconnect', () => {
      console.log(`Disconnected from Socket.IO server for messenger ${messengerId}`);
    });
  }

  return sockets[messengerId];
};

export const closeSocket = (messengerId) => {
  if (sockets[messengerId]) {
    sockets[messengerId].disconnect();
    delete sockets[messengerId];
  }
};