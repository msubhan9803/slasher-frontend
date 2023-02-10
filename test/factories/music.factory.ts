import { Factory } from 'fishery';
import { Music } from '../../src/schemas/music/music.schema';
import {
  MusicStatus,
  MusicDeletionState,
} from '../../src/schemas/music/music.enums';

export const musicFactory = Factory.define<Partial<Music>>(
  () => new Music({
      name: 'Addicted to Love',
      status: MusicStatus.Active,
      deleted: MusicDeletionState.NotDeleted,
    }),
);
