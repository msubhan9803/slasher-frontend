import { Connection, ConnectionStates } from 'mongoose';
import { waitFor } from '../../src/utils/timer-utils';

export const dropCollections = async (connection: Connection) => {
  // Before attempting to stop any collections, make sure db connection is in the connected state
  waitFor(() => connection.readyState === ConnectionStates.connected, 5000);

  await Promise.all(
    (await connection.db.collections()).map((collection) => collection.deleteMany({})),
  );
};
