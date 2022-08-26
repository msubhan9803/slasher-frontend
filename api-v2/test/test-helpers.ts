import { Model } from 'mongoose';

export const truncateAllCollections = async (anyModel: Model<any>) => {
  for (const collection of Object.values(anyModel.db.collections)) {
    if (collection) {
      await collection.deleteMany({});
    }
  }
};
