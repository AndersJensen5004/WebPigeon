import io from 'socket.io-client';
import config from './config';

let socket = null;

export const initializeSocket = (userId) => {
  if (!socket) {
    socket = io(config.apiBaseUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      query: { userId }
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });
  }

  return socket;
};

export const joinMessenger = (messengerId) => {
  if (socket) {
    socket.emit('join', { messenger_id: messengerId });
  }
};

export const leaveMessenger = (messengerId) => {
  if (socket) {
    socket.emit('leave', { messenger_id: messengerId });
  }
};

export const sendMessage = (messengerId, content) => {
  if (socket) {
    socket.emit('new_message', {
      messenger_id: messengerId,
      content: content
    });
  }
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};