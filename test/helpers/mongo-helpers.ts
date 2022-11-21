import { Connection } from 'mongoose';

export const dropCollections = async (connection: Connection) => {
  await Promise.all(
    (await connection.db.collections()).map((collection) => collection.deleteMany({})),
  );
};
