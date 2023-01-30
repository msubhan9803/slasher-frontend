import Cookies from 'js-cookie';
import React from 'react';
import { io, Socket } from 'socket.io-client';
import { apiUrl } from '../constants';

const token = Cookies.get('sessionToken');

export const socket = io(apiUrl!, {
  transports: ['websocket'],
  auth: { token },
});

// This is mostly just here to help with troubleshooting if there are ever any connection issues.
// This will just prove whether or not authentication worked. If authentication fails,
// the client is automatically disconnected.
socket.once('authSuccess', (payload) => {
  if (payload.success) {
    (socket as any).slasherAuthSuccess = true;
  }
});

export const SocketContext = React.createContext<Socket | null>(null);
