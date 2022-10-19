import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { FriendsService } from '../../../src/friends/providers/friends.service';
import { Friend, FriendDocument } from '../../../src/schemas/friend/friend.schema';
import { FriendRequestReaction } from '../../../src/schemas/friend/friend.enums';

describe('Users suggested friends (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let user1: User;
  let configService: ConfigService;
  let friendsService: FriendsService;
  let friendsModel: Model<FriendDocument>;
  let receivedFriendRequestsData;
  let friends;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    friendsModel = moduleRef.get<Model<FriendDocument>>(getModelToken(Friend.name));
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
      beforeEach(async () => {
        activeUser = await usersService.create(userFactory.build());
        activeUserAuthToken = activeUser.generateNewJwtToken(
          configService.get<string>('JWT_SECRET_KEY'),
        );
        user1 = await usersService.create(userFactory.build());

        for (let i = 0; i < 5; i += 1) {
          await friendsModel.create({
            from: user1._id.toString(),
            to: activeUser._id.toString(),
            reaction: FriendRequestReaction.Pending,
          });
        }
        receivedFriendRequestsData = await friendsService.getReceivedFriendRequests(activeUser._id.toString(), 3);
        friends = receivedFriendRequestsData.map(({ _id, ...friend }) => ({ ...friend }));
      });
      it('returns the expected user initial data', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/initial-data')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
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
          friendRequests: friends,
        });
      });
    });
  });
});
