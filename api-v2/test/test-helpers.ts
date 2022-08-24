import { Model } from 'mongoose';

export async function truncateAllCollections(anyModel: Model<any>) {
  for (const collection of Object.values(anyModel.db.collections)) {
    await collection.deleteMany({});
  }
}
