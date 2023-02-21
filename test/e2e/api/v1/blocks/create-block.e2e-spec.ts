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
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';

describe('Create Block (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let user2: UserDocument;
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
    configureAppPrefixAndVersioning(app);
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
    await blocksModel.create({
      from: activeUser.id,
      to: user1._id,
      reaction: BlockAndUnblockReaction.Block,
    });
    await blocksModel.create({
      from: activeUser.id,
      to: user2._id,
      reaction: BlockAndUnblockReaction.Block,
    });
  });

  describe('POST /api/v1/blocks', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).post('/api/v1/blocks').expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Create Block Request', () => {
      it('successfully create block.', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/blocks')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ userId: user1._id })
          .expect(HttpStatus.CREATED)
          .expect({ success: true });
        expect(await blocksModel.findOne({ to: user1._id })).toBeTruthy();
      });
    });
  });

  describe('Validation', () => {
    it('userId should not be empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/blocks')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ userId: '' });
      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain(
        'userId should not be empty',
      );
    });

    it('userId must match regular expression', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/blocks')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ userId: 'aaa' });
      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain('userId must match /^[a-f\\d]{24}$/i regular expression');
    });
  });
});
