import { INestApplication } from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { https } from 'follow-redirects';
import { createWriteStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { EventCategoriesService } from '../src/event-categories/providers/event-categories.service';
import { ActiveStatus } from '../src/schemas/user/user.enums';
import { UsersService } from '../src/users/providers/users.service';
import { eventCategoryFactory } from '../test/factories/event-category.factory';
import { userFactory } from '../test/factories/user.factory';
import { createApp } from './createApp';
import { FeedPostsService } from '../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../test/factories/feed-post.factory';
import { UserDocument } from '../src/schemas/user/user.schema';

async function downloadFile(app: INestApplication, url: string, savePath: string) {
  const file = createWriteStream(savePath);

  await new Promise<void>((resolve, reject) => {
    https.get(url, (res) => {
      res.pipe(file);
      // after download completed close filestream
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (e) => reject(e));
  });
}

async function createRandomPostsForUser(app: INestApplication, user: UserDocument) {
  const feedPostsService = app.get<FeedPostsService>(FeedPostsService);
  // We need to put some sample images in the upload directory.
  const imagePath = `/feed/feed_${uuidv4()}.jpg`;
  await downloadFile(app, faker.image.cats(), `./local-storage${imagePath}`);
  await feedPostsService.create(
    feedPostFactory.build({ message: faker.lorem.paragraph(), userId: user.id, images: [{ image_path: imagePath }] }),
  );
}

async function createSampleUsers(app: INestApplication) {
  const usersService = app.get<UsersService>(UsersService);

  // Create a couple of users that we can log in as
  const loginUsers = [
    userFactory.build(
      { userName: 'SampleUser1', status: ActiveStatus.Active },
      { transient: { unhashedPassword: 'samplepassword1' } },
    ),
    userFactory.build(
      { userName: 'SampleUser2', status: ActiveStatus.Active },
      { transient: { unhashedPassword: 'samplepassword2' } },
    ),
  ];
  for (const unsavedUser of loginUsers) {
    const user = await usersService.create(unsavedUser);
    await createRandomPostsForUser(app, user);
  }

  // Create some other users that will just be friends
  for (let i = 0; i < 10; i += 1) {
    const user = await usersService.create(userFactory.build(
      { firstName: faker.name.firstName(), userName: `${faker.word.adjective()}_${faker.word.noun()}${i}`, status: ActiveStatus.Active },
    ));
    await createRandomPostsForUser(app, user);
  }
}

async function createSampleEventCategories(app: INestApplication) {
  const eventCategoriesService = app.get<EventCategoriesService>(EventCategoriesService);

  const eventCategories = [
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
  for (const categoryName of eventCategories) {
    await eventCategoriesService.create(eventCategoryFactory.build({ event_name: categoryName }));
  }
}

(async () => {
  const app = await createApp();
  await createSampleUsers(app);
  await createSampleEventCategories(app);
  app.close();
})();
