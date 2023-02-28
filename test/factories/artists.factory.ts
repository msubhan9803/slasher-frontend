import { Factory } from 'fishery';
import { Artist } from '../../src/schemas/artist/artist.schema';
import {
  ArtistStatus,
  ArtistDeletionState,
} from '../../src/schemas/artist/artist.enums';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

export const artistsFactory = Factory.define<Partial<Artist>>(
  () => new Artist({
      name: 'The Canvas Life',
      status: ArtistStatus.Active,
      deleted: ArtistDeletionState.NotDeleted,
    }),
);

addFactoryToRewindList(artistsFactory);
