import { INestApplication } from '@nestjs/common';
import { TasksService } from '../src/app/providers/tasks.service';
import { createApp } from './createApp';

async function runOldNotificationCleanup(app: INestApplication) {
  const tasksService = app.get<TasksService>(TasksService);
  await tasksService.cleanupNotifications(true);
}

(async () => {
  const app = await createApp();
  await runOldNotificationCleanup(app);
  app.close();
})();
