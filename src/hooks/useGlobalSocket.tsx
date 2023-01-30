import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../context/socket';

/**
 * Returns the global socket and a variable indicating whether the socket is ready to be used.
 * Note: This hook can only be used inside components that are wrapped by <SocketContext.Provider>.
 * @returns
 */
const useGlobalSocket = () => {
  const socket = useContext(SocketContext)!;
  const [socketConnected, setSocketConnected] = useState(socket && socket.connected);

  const socketOnConnectHandler = () => { setSocketConnected(true); };
  const socketOnDisconnectHandler = () => { setSocketConnected(false); };

  // Check for socket connection event
  useEffect(() => {
    if (socket) {
      socket.on('connect', socketOnConnectHandler);
      // Reminder: If auth fails, the disconnect event
      // will fire because the server severs the connection.
      socket.on('disconnect', socketOnDisconnectHandler);
      return () => {
        socket.off('connect', socketOnConnectHandler);
        socket.off('disconnect', socketOnDisconnectHandler);
      };
    }
    return undefined;
  }, []);

  return { socket, socketConnected };
};

export default useGlobalSocket;
