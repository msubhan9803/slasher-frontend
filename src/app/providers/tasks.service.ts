import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MoviesService } from '../../movies/providers/movies.service';

@Injectable()
export class TasksService {
  constructor(private readonly moviesService: MoviesService) { }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    name: 'syncWithTheMovieDb',
    timeZone: 'America/New_York',
  })
  async syncWithTheMovieDb() {
    const startYear = 1895;
    // Ask for 10 years ahead so we also get movies that have not come out yet
    // (even though this may mean that they have limited data).
    const endYear = new Date().getFullYear() + 10;
    await this.moviesService.syncWithTheMovieDb(startYear, endYear);
  }
}
