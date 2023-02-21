import { Factory } from 'fishery';
import { RssFeed } from '../../src/schemas/rssFeed/rssFeed.schema';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

export const rssFeedFactory = Factory.define<Partial<RssFeed>>(
  ({ sequence }) => new RssFeed({
      title: `Rss Feed ${sequence}`,
    }),
);

addFactoryToRewindList(rssFeedFactory);
