import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { userFactory } from '../../../../factories/user.factory';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { FriendsService } from '../../../../../src/friends/providers/friends.service';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { Friend, FriendDocument } from '../../../../../src/schemas/friend/friend.schema';
import { FriendRequestReaction } from '../../../../../src/schemas/friend/friend.enums';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { NotificationType } from '../../../../../src/schemas/notification/notification.enums';
import { NotificationsService } from '../../../../../src/notifications/providers/notifications.service';

describe('Accept Friend Request (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let user2: UserDocument;
  let configService: ConfigService;
  let friendsService: FriendsService;
  let notificationService: NotificationsService;
  let friendsModel: Model<FriendDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    notificationService = moduleRef.get<NotificationsService>(NotificationsService);
    friendsModel = moduleRef.get<Model<FriendDocument>>(getModelToken(Friend.name));

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();
    activeUser = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
    user2 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    await friendsService.createFriendRequest(user1._id.toString(), activeUser.id);
    await friendsService.createFriendRequest(activeUser.id, user2._id.toString());
  });

  describe('POST /api/v1/friends/requests/accept', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).post('/api/v1/friends/requests/accept').expect(HttpStatus.UNAUTHORIZED);
    });

    it('when successful, returns the expected response', async () => {
      jest.spyOn(notificationService, 'create').mockImplementation(() => Promise.resolve(undefined));

      const response = await request(app.getHttpServer())
        .post('/api/v1/friends/requests/accept')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ userId: user1.id })
        .expect(HttpStatus.CREATED);
      const friends = await friendsModel.findOne({ from: user1._id, to: activeUser.id });
      expect(friends.reaction).toEqual(FriendRequestReaction.Accepted);
      expect(notificationService.create).toHaveBeenCalledWith({
        userId: user1.id,
        senderId: activeUser._id,
        notifyType: NotificationType.UserAcceptedYourFriendRequest,
        notificationMsg: 'accepted your friend request',
      });
      expect(response.body).toEqual({ success: true });
    });

    it('if friendship status is already accepted then it will not create notification', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/friends/requests/accept')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ userId: user1.id })
        .expect(HttpStatus.CREATED);

      const response1 = await request(app.getHttpServer())
        .post('/api/v1/friends/requests/accept')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ userId: user1.id })
        .expect(HttpStatus.CREATED);
      const friends = await friendsModel.findOne({ from: user1._id, to: activeUser.id });
      expect(friends.reaction).toEqual(FriendRequestReaction.Accepted);
      expect(response1.body).toEqual({ success: true });
    });

    it('when the friend request has been sent BY the active user (not TO the expected user), '
      + 'then it returns the expected error message', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/friends/requests/accept')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ userId: user2._id })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.message).toContain('Unable to accept friend request');
      });

    describe('Validation', () => {
      it('userId should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/friends/requests/accept')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ userId: '' });
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId should not be empty',
        );
      });

      it('userId must match regular expression', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/friends/requests/accept')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ userId: 'aaa' });
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId must be a mongodb id',
        );
      });
    });
  });
});
