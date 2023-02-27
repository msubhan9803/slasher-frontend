import { Factory } from 'fishery';
import { FeedComment } from '../../src/schemas/feedComment/feedComment.schema';
import { imageFactory } from './image.factory';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

export const feedCommentsFactory = Factory.define<Partial<FeedComment>>(
  ({ sequence }) => new FeedComment({
    message: `Message ${sequence}`,
    images: imageFactory.buildList(2),
  }),
);

addFactoryToRewindList(feedCommentsFactory);
