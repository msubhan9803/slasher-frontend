import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Podcast, PodcastDocument } from '../../schemas/podcast/podcast.schema';
import {
  PodcastStatus,
  PodcastDeletionState,
} from '../../schemas/podcast/podcast.enums';

@Injectable()
export class PodcastsService {
  constructor(
    @InjectModel(Podcast.name) private podcastsModel: Model<PodcastDocument>,
  ) {}

  async create(podcastData: Partial<Podcast>): Promise<PodcastDocument> {
    return this.podcastsModel.create(podcastData);
  }

  async findAll(): Promise<PodcastDocument[]> {
    const podcastFind: any = {
      deleted: PodcastDeletionState.NotDeleted,
      status: PodcastStatus.Active,
    };

    return this.podcastsModel
      .find(podcastFind)
      .select('name')
      .sort({
        name: 1,
      })
      .exec();
  }
}
