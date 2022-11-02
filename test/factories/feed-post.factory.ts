import { Factory } from 'fishery';
import { FeedPost } from '../../src/schemas/feedPost/feedPost.schema';
import { imageFactory } from './image.factory';

export const feedPostFactory = Factory.define<Partial<FeedPost>>(
  ({ sequence }) => new FeedPost({
    message: `Message ${sequence}`,
    images: imageFactory.buildList(2),
  }),
);
