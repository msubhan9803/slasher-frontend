import { Connection, ConnectionStates } from 'mongoose';
import { waitFor } from '../../src/utils/timer-utils';

export const clearDatabase = async (connection: Connection) => {
  // Before attempting to stop any collections, make sure db connection is in the connected state
  await waitFor(() => connection.readyState === ConnectionStates.connected, 5000);

  // Delete records from all collections
  // await Promise.all(
  //   (await connection.db.collections()).map((collection) => collection.deleteMany({})),
  // );

  // Drop entire database (which will drop all collections in one operation)
  await connection.dropDatabase();
};
