import { Factory } from 'fishery';
import { RssFeed } from '../../src/schemas/rssFeed/rssFeed.schema';

export const rssFeedFactory = Factory.define<Partial<RssFeed>>(
  ({ sequence }) => new RssFeed({
      title: `Rss Feed ${sequence}`,
    }),
);
