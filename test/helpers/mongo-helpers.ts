import { Connection } from 'mongoose';

export const dropCollections = async (connection: Connection) => {
  // Before dropping any collections, make sure the db connection is available
  // connection.readyState === ConnectionStates.connected
  // eslint-disable-next-line no-console
  console.log(`connection.readyState is: ${connection.readyState}`);

  await Promise.all(
    (await connection.db.collections()).map((collection) => collection.deleteMany({})),
  );
};
