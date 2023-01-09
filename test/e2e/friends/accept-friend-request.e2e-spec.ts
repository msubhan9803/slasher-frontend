import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { userFactory } from '../../factories/user.factory';
import { UsersService } from '../../../src/users/providers/users.service';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { FriendsService } from '../../../src/friends/providers/friends.service';
import { clearDatabase } from '../../helpers/mongo-helpers';

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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
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
    await clearDatabase(connection);
    activeUser = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
    user2 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    await friendsService.createFriendRequest(activeUser._id.toString(), user1._id.toString());
    await friendsService.createFriendRequest(user1._id.toString(), activeUser._id.toString());
    await friendsService.createFriendRequest(activeUser._id.toString(), user2._id.toString());
  });

  describe('Post /friends/requests/accept', () => {
    it('when successful, returns the expected response', async () => {
      const response = await request(app.getHttpServer())
        .post('/friends/requests/accept')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ userId: user1._id });
        expect(response.body).toEqual({ success: true });
    });

    it('when the friend request has been sent BY the active user (not TO the expected user), '
      + 'then it returns the expected error message', async () => {
        const response = await request(app.getHttpServer())
          .post('/friends/requests/accept')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ userId: user2._id })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.message).toContain('Unable to accept friend request');
      });

    describe('Validation', () => {
      it('userId should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .post('/friends/requests/accept')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ userId: '' });
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId should not be empty',
        );
      });

      it('userId must match regular expression', async () => {
        const response = await request(app.getHttpServer())
          .post('/friends/requests/accept')
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
