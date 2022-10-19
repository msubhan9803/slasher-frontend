import { INestApplication } from '@nestjs/common';
import { EventCategoriesService } from '../src/event-categories/providers/event-categories.service';
import { ActiveStatus } from '../src/schemas/user/user.enums';
import { User } from '../src/schemas/user/user.schema';
import { UsersService } from '../src/users/providers/users.service';
import { createApp } from './createApp';

async function createSampleUsers(app: INestApplication) {
  const usersService = await app.get<UsersService>(UsersService);

  const usersToCreate = [
    {
      data: {
        betaTester: true,
        userName: 'SampleUser1',
        firstName: 'Sample1',
        email: 'sample1@example.com',
        status: ActiveStatus.Active,
        securityQuestion: 'What time is it?',
        securityAnswer: 'Adventure time!',
      },
      unhashedPassword: 'samplepassword1',
    },
    {
      data: {
        betaTester: true,
        userName: 'SampleUser2',
        firstName: 'Sample2',
        email: 'sample2@example.com',
        status: ActiveStatus.Active,
        securityQuestion: 'How soon is now?',
        securityAnswer: 'Very soon!',
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

async function createSampleEventCategories(app: INestApplication) {
  const eventCategoriesService = await app.get<EventCategoriesService>(EventCategoriesService);

  const categoriesToCreate = [
    'Art Exhibits',
    'Conventions',
    'Event Calendar',
    'Film Festival',
    'Haunts',
    'Live Music',
    'Market',
    'Party',
    'Tours',
    'Trivia / Game Night',
  ];
  for (const categoryName of categoriesToCreate) {
    await eventCategoriesService.create({
      event_name: categoryName,
    });
  }
}

// async function createSampleNotifications(app: INestApplication) {
//   const usersService = await app.get<UsersService>(UsersService);
//   const notificationsService = await app.get<NotificationsService>(
//     NotificationsService,
//   );

//   const users = await usersService.findAll(1, 2);

//   for (const user of users) {
//     await notificationsService.create({
//       userId: user._id,
//       notificationMsg: `This is a sample notification for ${user.userName}.`,
//     });
//   }
// }

(async () => {
  const app = await createApp();
  await createSampleUsers(app);
  await createSampleEventCategories(app);
  // await createSampleNotifications(app);
  app.close();
})();
