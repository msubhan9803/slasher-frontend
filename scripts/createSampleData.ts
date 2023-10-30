import { INestApplication } from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
// eslint-disable-next-line import/no-extraneous-dependencies
import { https } from 'follow-redirects';
import { createWriteStream, mkdirSync } from 'fs';
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
import { randomBoolean, randomIntInclusive } from '../src/utils/random-utils';
import { Image } from '../src/schemas/shared/image.schema';
import { FriendsService } from '../src/friends/providers/friends.service';

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

async function createRandomPostsForUser(app: INestApplication, user: UserDocument, numPosts: number) {
  for (let i = 0; i < numPosts; i += 1) {
    const feedPostsService = app.get<FeedPostsService>(FeedPostsService);

    // Ensure that ./local-storage/feed path exists
    mkdirSync('./local-storage/feed', { recursive: true });

    const images: Image[] = [];
    if (randomBoolean()) {
      // We need to put some sample images in the upload directory.
      const imagePath = `/feed/feed_${uuidv4()}.jpg`;
      await downloadFile(app, faker.image.cats(), `./local-storage${imagePath}`);
      // Note: faker.image.cats() = "https://loremflickr.com/640/480/cats"

      images.push({ image_path: imagePath, description: null });
    }

    const numParagraphs = randomIntInclusive(1, 3);
    const messagePieces = [];
    for (let j = 0; j < numParagraphs; j += 1) {
      messagePieces.push(randomBoolean() ? faker.lorem.paragraph() : faker.lorem.sentence());
    }

    await feedPostsService.create(
      feedPostFactory.build({ message: messagePieces.join('\n\n'), userId: user.id, images }),
    );
  }
}

async function createSampleUsers(app: INestApplication) {
  const usersService = app.get<UsersService>(UsersService);
  const friendsService = app.get<FriendsService>(FriendsService);

  const sampleUser1 = await usersService.create(userFactory.build(
    { userName: 'SampleUser1', status: ActiveStatus.Active },
    { transient: { unhashedPassword: 'samplepassword1' } },
  ));

  const sampleUser2 = await usersService.create(userFactory.build(
    { userName: 'SampleUser2', status: ActiveStatus.Active },
    { transient: { unhashedPassword: 'samplepassword2' } },
  ));

  // Create random posts for the new users
  for (const user of [sampleUser1, sampleUser2]) {
    await createRandomPostsForUser(app, user, 3);
  }

  // Create some other users that will just be friends
  for (let i = 0; i < 20; i += 1) {
    const user = await usersService.create(userFactory.build(
      { firstName: faker.name.firstName(), userName: `${faker.word.adjective()}_${faker.word.noun()}${i}`, status: ActiveStatus.Active },
    ));
    await createRandomPostsForUser(app, user, 5);

    // 1/3 of users will be friends with SampleUser1
    if (i % 3 === 0) {
      await friendsService.createFriendRequest(sampleUser1.id, user.id);
      await friendsService.acceptFriendRequest(sampleUser1.id, user.id);
    }

    // 1/3 of users will have a pending friend request with SampleUser1
    if (i % 3 === 1) {
      await friendsService.createFriendRequest(sampleUser2.id, user.id);
    }

    // 1/2 of users will be friends with SampleUser2
    if (i % 2 === 0) {
      await friendsService.createFriendRequest(sampleUser2.id, user.id);
      await friendsService.acceptFriendRequest(sampleUser2.id, user.id);
    }
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
