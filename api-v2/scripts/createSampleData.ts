import { INestApplication } from '@nestjs/common';
import { NotificationsService } from '../src/notifications/providers/notifications.service';
import { ActiveStatus, User } from '../src/schemas/user.schema';
import { UsersService } from '../src/users/providers/users.service';
import { createApp } from './createApp';

(async () => {
  const app = await createApp();
  await createSampleUsers(app);
  await createSampleNotifications(app);
  app.close();
})();

async function createSampleUsers(app: INestApplication) {
  const usersService = await app.get<UsersService>(UsersService);

  const usersToCreate = [
    {
      data: {
        userName: 'SampleUser1',
        firstName: 'Sample1',
        email: 'sample1@example.com',
        status: ActiveStatus.Active,
      },
      unhashedPassword: 'samplepassword1',
    },
    {
      data: {
        userName: 'SampleUser2',
        firstName: 'Sample2',
        email: 'sample2@example.com',
        status: ActiveStatus.Active,
      },
      unhashedPassword: 'samplepassword2',
    },
  ];

  return Promise.all(
    usersToCreate.map((userToCreate) => {
      const user = new User(userToCreate.data);
      user.setUnhashedPassword(userToCreate.unhashedPassword);
      return usersService.create(user);
    }),
  );
}

async function createSampleNotifications(app: INestApplication) {
  const usersService = await app.get<UsersService>(UsersService);
  const notificationsService = await app.get<NotificationsService>(
    NotificationsService,
  );

  const users = await usersService.findAll(1, 2);

  for (const user of users) {
    await notificationsService.create({
      userId: user._id,
      notificationMsg: `This is a sample notification for ${user.userName}.`,
    });
  }
}
