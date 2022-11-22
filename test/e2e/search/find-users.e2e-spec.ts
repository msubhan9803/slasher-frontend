import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { userFactory } from '../../factories/user.factory';
import { UsersService } from '../../../src/users/providers/users.service';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { dropCollections } from '../../helpers/mongo-helpers';

describe('Find Users(e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let configService: ConfigService;
  let blocksModel: Model<BlockAndUnblockDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
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
    await dropCollections(connection);

    activeUser = await usersService.create(userFactory.build({ userName: 'Count Rock' }));
    user1 = await usersService.create(userFactory.build({ userName: 'Jack' }));
    await usersService.create(userFactory.build({ userName: 'Deni' }));
    await usersService.create(userFactory.build({ userName: 'The Count' }));
    await usersService.create(userFactory.build({ userName: 'Count Dracula' }));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    await blocksModel.create({
      from: activeUser._id,
      to: user1._id,
      reaction: BlockAndUnblockReaction.Block,
    });
  });

  describe('GET /search/users', () => {
    describe('Find Users Details', () => {
      it('retrn the expected users', async () => {
        const query = 'Count';
        const limit = 20;
        const response = await request(app.getHttpServer())
          .get(`/search/users?query=${query}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toHaveLength(2);
      });

      it('when offset is apply than expected response', async () => {
        const query = 'Count';
        const limit = 20;
        const offset = 1;
        const response = await request(app.getHttpServer())
          .get(`/search/users?query=${query}&limit=${limit}&offset=${offset}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toHaveLength(1);
      });
    });
  });

  describe('Validation', () => {
    it('limit should not be empty', async () => {
      const query = 'test';
      const response = await request(app.getHttpServer())
        .get(`/search/users?query=${query}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body.message).toContain('limit should not be empty');
    });

    it('limit should be a number', async () => {
      const limit = 'a';
      const query = 'test';
      const response = await request(app.getHttpServer())
        .get(`/search/users?query=${query}&limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
    });

    it('limit should not be grater than 30', async () => {
      const limit = 31;
      const query = 'test';
      const response = await request(app.getHttpServer())
        .get(`/search/users?query=${query}&limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body.message).toContain('limit must not be greater than 30');
    });

    it('query must be shorter than or equal to 30 characters', async () => {
      const limit = 31;
      const query = 'testtesttesttesttesttesttesttest';
      const response = await request(app.getHttpServer())
        .get(`/search/users?query=${query}&limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body.message).toContain('query must be shorter than or equal to 30 characters');
    });

    it('query should not be empty', async () => {
      const limit = 31;
      const response = await request(app.getHttpServer())
        .get(`/search/users?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body.message).toContain('query should not be empty');
    });

    it('offset should be a number', async () => {
      const offset = 'a';
      const limit = 5;
      const query = 'test';
      const response = await request(app.getHttpServer())
        .get(`/search/users?query=${query}&limit=${limit}&offset=${offset}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body.message).toContain('offset must be a number conforming to the specified constraints');
    });
  });
});
