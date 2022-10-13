import { Factory } from 'fishery';
import { ObjectId } from 'mongoose';
import { FeedPost } from '../../src/schemas/feedPost/feedPost.schema';
import { imageFactory } from './image.factory';

type UserTransientParams = {
  userId: ObjectId;
};

export const feedPostFactory = Factory.define<Partial<FeedPost>, UserTransientParams>(
  ({ sequence, transientParams }) => new FeedPost({
      message: `Message ${sequence}`,
      images: imageFactory.build(),
      userId: transientParams.userId,
    }),
);
