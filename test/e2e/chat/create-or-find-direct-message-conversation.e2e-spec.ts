import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { ChatService } from '../../../src/chat/providers/chat.service';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { MatchList, MatchListDocument } from '../../../src/schemas/matchList/matchList.schema';
import { FriendsService } from '../../../src/friends/providers/friends.service';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';

describe('Create Or Find Direct Message Conversation / (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let chatService: ChatService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let matchListModel: Model<MatchListDocument>;
  let friendsService: FriendsService;
  let blocksModel: Model<BlockAndUnblockDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    chatService = moduleRef.get<ChatService>(ChatService);
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    matchListModel = moduleRef.get<Model<MatchListDocument>>(getModelToken(MatchList.name));
    friendsService = moduleRef.get<FriendsService>(FriendsService);

    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });
  describe('POST /chat/conversations/create-or-find-direct-message-conversation', () => {
    describe('create or find direct message conversation', () => {
      let users;
      let matchList;

      beforeEach(async () => {
        users = await Promise.all([
          userFactory.build(),
          userFactory.build(),
          userFactory.build(),
        ].map((userData) => usersService.create(userData)));

        matchList = await chatService.createPrivateDirectMessageConversation([users[0]._id, activeUser._id.toString()]);
      });
      it('finds an existing conversation by searching for the participants of that conversation', async () => {
        await friendsService.createFriendRequest(activeUser._id.toString(), users[0]._id.toString());
        await friendsService.acceptFriendRequest(activeUser._id.toString(), users[0]._id.toString());
        const response = await request(app.getHttpServer())
          .post('/api/v1/chat/conversations/create-or-find-direct-message-conversation')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ userId: users[0]._id });
        expect(response.body._id).toEqual(matchList._id.toString());
      });

      it('creates a conversation if one does not exist with the given participants', async () => {
        const matchListCount = await matchListModel.count();
        await friendsService.createFriendRequest(activeUser._id.toString(), users[1]._id.toString());
        await friendsService.acceptFriendRequest(activeUser._id.toString(), users[1]._id.toString());

        const response = await request(app.getHttpServer())
          .post('/api/v1/chat/conversations/create-or-find-direct-message-conversation')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ userId: users[1]._id });
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          participants: [
            expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          ],
        });
        const newMatchListCount = await matchListModel.count();
        expect(newMatchListCount - matchListCount).toBe(1);
      });

      it('when user is block than expected response.', async () => {
        const user1 = await usersService.create(userFactory.build());
        await blocksModel.create({
          from: activeUser._id,
          to: user1._id,
          reaction: BlockAndUnblockReaction.Block,
        });
        const response = await request(app.getHttpServer())
          .post('/api/v1/chat/conversations/create-or-find-direct-message-conversation')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ userId: user1._id });
        expect(response.status).toEqual(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'Request failed due to user block.',
          statusCode: HttpStatus.FORBIDDEN,
        });
      });
    });

    describe('should NOT create/find direct message conversation when users are *not* friends', () => {
      let users;

      beforeEach(async () => {
        users = await Promise.all([
          userFactory.build(),
          userFactory.build(),
        ].map((userData) => usersService.create(userData)));
      });

      it('returns the expected response status and error message, and does not create a new conversation', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/chat/conversations/create-or-find-direct-message-conversation')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ userId: users[1]._id });
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(response.body).toEqual({ statusCode: 401, message: 'You must be friends with this user to perform this action.' });
        const matchListCount = await matchListModel.count();
        expect(matchListCount).toBe(0);
      });
    });

    describe('Validation', () => {
      it('userId must be a mongodb id', async () => {
        const userId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .post('/api/v1/chat/conversations/create-or-find-direct-message-conversation')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ userId });
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId must be a mongodb id',
        );
      });
    });
  });
});
