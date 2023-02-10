import { Factory } from 'fishery';
import { Podcast } from '../../src/schemas/podcast/podcast.schema';
import {
  PodcastStatus,
  PodcastDeletionState,
} from '../../src/schemas/podcast/podcast.enums';

export const podcastsFactory = Factory.define<Partial<Podcast>>(
  () => new Podcast({
      name: 'Freakonomics Radio',
      status: PodcastStatus.Active,
      deleted: PodcastDeletionState.NotDeleted,
    }),
);
