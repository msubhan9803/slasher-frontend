import { Factory } from 'fishery';
import { RssFeedProvider } from '../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

export const rssFeedProviderFactory = Factory.define<Partial<RssFeedProvider>>(
  ({ sequence }) => new RssFeedProvider({
    title: `RssFeedProvider ${sequence}`,
  }),
);

addFactoryToRewindList(rssFeedProviderFactory);
