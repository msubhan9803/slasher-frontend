import { Socket } from 'socket.io-client';

type SocketStoreType = {
  socket: null | Socket,
};

const socketStore: SocketStoreType = {
  socket: null,
};

export default socketStore;
