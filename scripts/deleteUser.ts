import { INestApplication } from '@nestjs/common';
import { createApp } from './createApp';
import { UsersService } from '../src/users/providers/users.service';

async function deleteUser(app: INestApplication) {
  const usersService = app.get<UsersService>(UsersService);
  const userId = 'some-user-id';
  usersService.delete(userId);
}

(async () => {
  const app = await createApp();
  await deleteUser(app);
  app.close();
})();
