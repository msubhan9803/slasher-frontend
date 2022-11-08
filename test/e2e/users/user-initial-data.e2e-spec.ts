import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { FriendsService } from '../../../src/friends/providers/friends.service';

describe('Users suggested friends (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let friendsService: FriendsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();
  });

  describe('GET /users/initial-data', () => {
    describe('Available user initial data in the database', () => {
      let user1: UserDocument;
      let user2: UserDocument;
      let user3: UserDocument;

      beforeEach(async () => {
        activeUser = await usersService.create(userFactory.build());
        activeUserAuthToken = activeUser.generateNewJwtToken(
          configService.get<string>('JWT_SECRET_KEY'),
        );
        user1 = await usersService.create(userFactory.build({ userName: 'Friend1' }));
        user2 = await usersService.create(userFactory.build({ userName: 'Friend2' }));
        user3 = await usersService.create(userFactory.build({ userName: 'Friend3' }));

        await friendsService.createFriendRequest(user3.id, activeUser.id);
        await friendsService.createFriendRequest(user1.id, activeUser.id);
        await friendsService.createFriendRequest(user2.id, activeUser.id);
      });
      it('returns the expected user initial data', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/initial-data')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          userId: activeUser.id,
          userName: activeUser.userName,
          notificationCount: 6,
          recentMessages: [
            {
              profilePic: 'https://i.pravatar.cc/300?img=47',
              userName: 'MaureenBiologist',
              shortMessage: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse interdum, tortor vel consectetur blandit,'
                + 'justo diam elementum massa, id tincidunt risus turpis non nisi. Integer eu lorem risus.',
            },
            {
              profilePic: 'https://i.pravatar.cc/300?img=56',
              userName: 'TeriDactyl',
              shortMessage: 'Maecenas ornare sodales mi, sit amet pretium eros scelerisque quis.'
                + 'Nunc blandit mi elit, nec varius erat hendrerit ac. Nulla congue sollicitudin eleifend.',
            },
            {
              profilePic: 'https://i.pravatar.cc/300?img=26',
              userName: 'BobRoss',
              shortMessage: 'Aenean luctus ac magna lobortis varius. Ut laoreet arcu ac commodo molestie. Nulla facilisi.'
                + 'Sed porta sit amet nunc tempus sollicitudin. Pellentesque ac lectus pulvinar, pulvinar diam sed, semper libero.',
            },
          ],
          friendRequests: [
            {
              _id: user2._id.toString(),
              userName: 'Friend2',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              firstName: user2.firstName,
            },
            {
              _id: user1._id.toString(),
              userName: 'Friend1',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              firstName: user1.firstName,
            },
            {
              _id: user3._id.toString(),
              userName: 'Friend3',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              firstName: user3.firstName,
            },
          ],
        });
      });
    });
  });
});
