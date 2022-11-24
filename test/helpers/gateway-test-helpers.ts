import { Connection } from 'mongoose';
import { Socket } from 'socket.io-client';
import { UsersService } from '../../src/users/providers/users.service';
import { sleep } from '../../src/utils/timer-utils';

const AUTH_SUCCESS_WAIT_TIMEOUT = 2000;
const SOCKET_CLEANUP_WAIT_TIMEOUT = 2000;

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

/**
 * This function checks the database and makes sure that there are no pending SocketUser entries.
 * We use this to ensure that socket disconnect cleanup has completed successfully before we end
 * a test.  This prevents erroneous test errors.
 * @param client
 */
export async function waitForSocketUserCleanup(client: Socket, usersService: UsersService) {
  const startTime = Date.now();

  while (Date.now() - startTime < SOCKET_CLEANUP_WAIT_TIMEOUT) {
    if (await usersService.getSocketUserCount() === 0) {
      return;
    }
    await sleep(100);
  }

  throw new Error('Waited for SocketUser count to reach 0, but reached timeout before that happened.');
}
