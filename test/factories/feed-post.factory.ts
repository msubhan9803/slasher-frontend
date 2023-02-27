import { Factory } from 'fishery';
import { FeedPost } from '../../src/schemas/feedPost/feedPost.schema';
import { imageFactory } from './image.factory';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

export const feedPostFactory = Factory.define<Partial<FeedPost>>(
  ({ sequence }) => new FeedPost({
    message: `Message ${sequence}`,
    images: imageFactory.buildList(2),
  }),
);

addFactoryToRewindList(feedPostFactory);
