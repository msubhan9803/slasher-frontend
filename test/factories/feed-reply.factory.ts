import { Factory } from 'fishery';
import { FeedReply } from '../../src/schemas/feedReply/feedReply.schema';
import { imageFactory } from './image.factory';

export const feedRepliesFactory = Factory.define<Partial<FeedReply>>(
  ({ sequence }) => new FeedReply({
    message: `Message ${sequence}`,
    images: imageFactory.buildList(2),
  }),
);
