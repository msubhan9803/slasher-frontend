import Cookies from 'js-cookie';
import React from 'react';
import { io, Socket } from 'socket.io-client';
import { apiUrl } from '../constants';

const token = Cookies.get('sessionToken');

export const socket = io(apiUrl!, {
  transports: ['websocket'],
  auth: { token },
});

// socket.once('authSuccess', (payload) => {
//   // eslint-disable-next-line no-console
//   console.log('authSuccess payload =', payload);
// });

export const SocketContext = React.createContext<Socket | null>(null);
