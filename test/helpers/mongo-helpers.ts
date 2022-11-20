import { Connection } from 'mongoose';

export const dropCollections = async (connection: Connection) => {
  // Before dropping any collections, make sure the db connection is available
  // connection.readyState === ConnectionStates.connected
  // eslint-disable-next-line no-console
  await Promise.all(
    (await connection.db.collections()).map((collection) => collection.deleteMany({})),
  );
};
