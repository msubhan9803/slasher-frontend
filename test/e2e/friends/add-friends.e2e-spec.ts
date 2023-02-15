import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { userFactory } from '../../factories/user.factory';
import { UsersService } from '../../../src/users/providers/users.service';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { Friend, FriendDocument } from '../../../src/schemas/friend/friend.schema';
import { FriendRequestReaction } from '../../../src/schemas/friend/friend.enums';
import { FriendsService } from '../../../src/friends/providers/friends.service';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { NotificationsService } from '../../../src/notifications/providers/notifications.service';
import { NotificationType } from '../../../src/schemas/notification/notification.enums';

describe('Add Friends (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let friendsService: FriendsService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let configService: ConfigService;
  let friendsModel: Model<FriendDocument>;
  let blocksModel: Model<BlockAndUnblockDocument>;
  let notificationsService: NotificationsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    friendsModel = moduleRef.get<Model<FriendDocument>>(getModelToken(Friend.name));
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    activeUser = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('Post /friends', () => {
    it('when friend request is successfully created, returns the expected response', async () => {
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));

      const response = await request(app.getHttpServer())
        .post('/friends')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ userId: user1._id })
        .expect(HttpStatus.CREATED);
      const friends = await friendsModel.findOne({ from: activeUser.id, to: user1._id });
      expect(friends.to.toString()).toEqual(user1.id);
      expect(response.body).toEqual({ success: true });

      expect(notificationsService.create).toHaveBeenCalledWith({
        userId: user1.id,
        senderId: activeUser._id,
        notifyType: NotificationType.UserSentYouAFriendRequest,
        notificationMsg: 'sent you a friend request',
      });
    });

    it('when friend request was previously declined, returns the expected response', async () => {
      const friends = await friendsModel.create({
        from: activeUser.id,
        to: user1.id,
        reaction: FriendRequestReaction.DeclinedOrCancelled,
      });
      const response = await request(app.getHttpServer())
        .post('/friends')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ userId: user1._id })
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual({ success: true });
      // Expect previous db entity to be deleted
      const friendData = await friendsModel.findOne({ _id: friends._id });
      expect(friendData).toBeNull();

      // Expect new pending entry to be created
      expect(
        (await friendsModel.findOne({ from: activeUser.id, to: user1._id })).reaction,
      ).toEqual(FriendRequestReaction.Pending);
    });

    it('when another user already sent a friend request to the active user, it accepts the friend request', async () => {
      await friendsService.createFriendRequest(user1.id, activeUser.id);
      const response = await request(app.getHttpServer())
        .post('/friends')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ userId: user1._id });
      expect(response.body).toEqual({ success: true });
      expect(response.status).toEqual(HttpStatus.CREATED);
      expect((await friendsService.findFriendship(user1.id, activeUser.id)).reaction).toEqual(FriendRequestReaction.Accepted);
    });

    it('user cannot send a friend request to yourself', async () => {
      const response = await request(app.getHttpServer())
        .post('/friends')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ userId: activeUser.id });
      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual({
        message: 'You cannot send a friend request to yourself',
        statusCode: 400,
      });
    });

    it('when user is block than expected response.', async () => {
      await blocksModel.create({
        from: activeUser.id,
        to: user1._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      const response = await request(app.getHttpServer())
        .post('/friends')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ userId: user1._id });
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Request failed due to user block.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    });

    describe('Validation', () => {
      it('userId should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .post('/friends')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ userId: '' });
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId should not be empty',
        );
      });

      it('userId must be a mongodb id', async () => {
        const response = await request(app.getHttpServer())
          .post('/friends')
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
