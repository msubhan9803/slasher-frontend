import { Socket } from 'socket.io-client';

const AUTH_SUCCESS_WAIT_TIMEOUT = 2000;

export async function waitForAuthSuccessMessage(client: Socket) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Did not receive authSuccess message in a reasonable amount of time'));
    }, AUTH_SUCCESS_WAIT_TIMEOUT);

    client.once('authSuccess', (payload) => {
      expect(payload).toEqual({ success: true });
      clearTimeout(timeout);
      resolve();
    });
  });
}
