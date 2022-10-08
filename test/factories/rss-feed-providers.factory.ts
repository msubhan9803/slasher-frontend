import { Factory } from 'fishery';
import { RssFeedProvider } from '../../src/schemas/rssFeedProvider/rssFeedProvider.schema';

export const rssFeedProviderFactory = Factory.define<Partial<RssFeedProvider>>(
  ({ sequence }) => new RssFeedProvider({
    title: `RssFeedProvider ${sequence}`,
  }),
);
