import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { ActiveStatus } from '../../../src/schemas/user/user.enums';
import { BlockAndUnblockReaction } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { pick } from '../../../src/utils/object-utils';

describe('Suggested user name (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
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
    activeUser = await usersService.create(userFactory.build(
      { userName: 'test-user1' },
    ));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('GET /users/suggest-user-name', () => {
    describe('Get all suggest user name', () => {
      let user1;
      let user2;
      beforeEach(async () => {
        user1 = await usersService.create(
          userFactory.build(
            { userName: 'test-user2' },
          ),
        );
        user2 = await usersService.create(
          userFactory.build(
            { userName: 'test-user3' },
          ),
        );
        await usersService.create(
          userFactory.build(
            { userName: 'test1' },
          ),
        );
        await usersService.create(
          userFactory.build(
            { userName: 'test2' },
          ),
        );
        await usersService.create(
          userFactory.build(
            { userName: 'test3', status: ActiveStatus.Deactivated, deleted: false },
          ),
        );
        await usersService.create(
          userFactory.build(
            { userName: 'te2', status: ActiveStatus.Deactivated, deleted: true },
          ),
        );
        await blocksModel.create({
          from: activeUser._id,
          to: user1._id,
          reaction: BlockAndUnblockReaction.Block,
        });
        await blocksModel.create({
          from: activeUser._id,
          to: user2._id,
          reaction: BlockAndUnblockReaction.Block,
        });
      });
      it('when query does exists than expected suggested user name', async () => {
        const limit = 20;
        const query = 'test';
        const response = await request(app.getHttpServer())
          .get(`/users/suggest-user-name?query=${query}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([
          pick(await usersService.findByUsername('test1'), ['userName', 'id', 'profilePic']),
          pick(await usersService.findByUsername('test2'), ['userName', 'id', 'profilePic']),
        ]);
        expect(response.body.map((suggestUserName) => suggestUserName.userName)).not.toContain('test3');
      });

      it('when query is wrong than expected response', async () => {
        const limit = 5;
        const query = 'yy';
        const response = await request(app.getHttpServer())
          .get(`/users/suggest-user-name?query=${query}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([]);
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const query = 'yy';
        const response = await request(app.getHttpServer())
          .get(`/users/suggest-user-name?query=${query}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/users/suggest-user-name?query=yy&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 20', async () => {
        const limit = 21;
        const response = await request(app.getHttpServer())
          .get(`/users/suggest-user-name?query=yy&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 20');
      });

      it('when query does not exists than expected suggested user name', async () => {
        const limit = 5;
        const response = await request(app.getHttpServer())
          .get(`/users/suggest-user-name?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('query should not be empty');
      });
    });
  });
});
