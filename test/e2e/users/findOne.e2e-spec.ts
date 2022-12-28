import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { relativeToFullImagePath } from '../../../src/utils/image-utils';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';

describe('GET /users/:id (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let otherUserAuthToken: string;
  let otherUser: UserDocument;
  let configService: ConfigService;
  let blocksModel: Model<BlockAndUnblockDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
  });

  describe('GET /users/:idOrUserName', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );

      otherUser = await usersService.create(userFactory.build());
      otherUserAuthToken = otherUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
    });

    describe('Find a user by id', () => {
      it('returns the expected response when logged in users requests their own user data', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          id: activeUser.id,
          aboutMe: activeUser.aboutMe,
          email: activeUser.email,
          userName: activeUser.userName,
          firstName: activeUser.firstName,
          profilePic: relativeToFullImagePath(configService, activeUser.profilePic),
          coverPhoto: relativeToFullImagePath(configService, null),
        });
      });

      it('returns the expected response (omitting email field) when logged in users requests different user data', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${activeUser.id}`)
          .auth(otherUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        // Hide email for users other than active user
        expect(response.body.email).toBeUndefined();
        expect(response.body).toEqual({
          id: activeUser.id,
          aboutMe: activeUser.aboutMe,
          userName: activeUser.userName,
          firstName: activeUser.firstName,
          profilePic: relativeToFullImagePath(configService, activeUser.profilePic),
          coverPhoto: relativeToFullImagePath(configService, null),
        });
      });

      it('returns the expected response when the user is not found', async () => {
        const nonExistentUserId = '5d1df8ebe9a186319c225cd6';
        const response = await request(app.getHttpServer())
          .get(`/users/${nonExistentUserId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: 'User not found',
          statusCode: 404,
        });
      });
    });
    describe('Find a user by userName', () => {
      it('returns the expected user', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${activeUser.userName}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          id: activeUser.id,
          aboutMe: activeUser.aboutMe,
          email: activeUser.email,
          userName: activeUser.userName,
          firstName: activeUser.firstName,
          profilePic: relativeToFullImagePath(configService, activeUser.profilePic),
          coverPhoto: relativeToFullImagePath(configService, null),
        });
      });

      it('returns the expected response when the user is not found', async () => {
        const nonExistentUserName = `No${activeUser.userName}`;
        const response = await request(app.getHttpServer())
          .get(`/users/${nonExistentUserName}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: 'User not found',
          statusCode: 404,
        });
      });

      it('returns the expected user and omit email field for other user', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${activeUser.userName}`)
          .auth(otherUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        // Hide email for users other than active user
        expect(response.body.email).toBeUndefined();
        expect(response.body).toEqual({
          id: activeUser.id,
          aboutMe: activeUser.aboutMe,
          userName: activeUser.userName,
          firstName: activeUser.firstName,
          profilePic: relativeToFullImagePath(configService, activeUser.profilePic),
          coverPhoto: relativeToFullImagePath(configService, null),
        });
      });
    });

    it('returns the expected response when block exists between users', async () => {
      await blocksModel.create({
        from: activeUser._id,
        to: otherUser._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      const response = await request(app.getHttpServer())
        .get(`/users/${otherUser._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({
        message: 'User not found',
        statusCode: 404,
      });
    });
  });
});
