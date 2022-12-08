import { INestApplication } from '@nestjs/common';
import { TasksService } from '../src/app/providers/tasks.service';
import { createApp } from './createApp';

async function runMovieDbSync(app: INestApplication) {
  const tasksService = app.get<TasksService>(TasksService);
  await tasksService.syncWithTheMovieDb(true);
}

(async () => {
  const app = await createApp();
  await runMovieDbSync(app);
  app.close();
})();
