import { Connection, ConnectionStates } from 'mongoose';
import { waitForAsyncFunction, waitForSyncFunction } from '../../src/utils/timer-utils';

export const dbHasActiveOperations = async (connection: Connection) => {
  const inProdQueryResult = await connection.db.admin().command({ currentOp: 1, active: true }) as any;
  const numCommandsInProgress = inProdQueryResult?.inprog?.length || 0;

  // Safety check (do not delete this): make sure that we do not modify the original connection object's selected database!
  if (connection.db.databaseName === 'admin') { throw new Error('Main connection has been unexpectedly set to admin.'); }

  // We expect at least one possible connection because a connection was running to check for the
  // number of active connections, but if there is MORE THAN one connection then that means that
  // some other active operation is running too.
  return numCommandsInProgress > 1;
};

// Delete records from all collections.  This preserves already-created indexes.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const databaseDeletionMethod1 = async (connection: Connection) => {
  await Promise.all(
    (await connection.db.collections()).map((collection) => collection.deleteMany({})),
  );
};

// Drop database and manually re-create indexes.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const databaseDeletionMethod2 = async (connection: Connection) => {
  // Get all collection models
  const mongooseModels = connection.modelNames().map((modelName) => connection.model(modelName));

  // Drop database
  await connection.dropDatabase();

  // Re-create indexes for all models
  await Promise.all(
    mongooseModels.map((schema) => schema.ensureIndexes()),
  );
};

export const clearDatabase = async (connection: Connection) => {
  // Before attempting to stop any collections, make sure db connection is in the connected state
  await waitForSyncFunction(() => connection.readyState === ConnectionStates.connected, 5000);

  // And also make sure that no other operations are running
  await waitForAsyncFunction(async () => !(await dbHasActiveOperations(connection)), 5000);

  await databaseDeletionMethod2(connection);

  // And also make sure that no other operations are running
  await waitForAsyncFunction(async () => !(await dbHasActiveOperations(connection)), 5000);
};
