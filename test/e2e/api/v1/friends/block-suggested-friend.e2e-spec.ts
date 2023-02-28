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
import { SuggestBlock, SuggestBlockDocument } from '../../../../../src/schemas/suggestBlock/suggestBlock.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { SuggestBlockReaction } from '../../../../../src/schemas/suggestBlock/suggestBlock.enums';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Block suggested friend (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let user2: UserDocument;
  let configService: ConfigService;
  let suggestBlockModel: Model<SuggestBlockDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    suggestBlockModel = moduleRef.get<Model<SuggestBlockDocument>>(getModelToken(SuggestBlock.name));

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
  });

  describe('POST /api/v1/friends/suggested/block', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).post('/api/v1/friends/suggested/block').expect(HttpStatus.UNAUTHORIZED);
    });

    it('when successful, returns the expected response', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/friends/suggested/block')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ userId: user1._id })
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual({ success: true });
      const suggestBlockData = await suggestBlockModel.findOne({ from: activeUser.id, to: user1._id });
      expect(suggestBlockData.reaction).toBe(SuggestBlockReaction.Block);
    });

    it('when the suggested friend is already unblock then it should update add as a block', async () => {
      const newSuggestBlockData = await suggestBlockModel.create({
        from: activeUser.id,
        to: user2.id,
        reaction: SuggestBlockReaction.Unblock,
      });
      expect(newSuggestBlockData.reaction).toBe(SuggestBlockReaction.Unblock);

      const response = await request(app.getHttpServer())
        .post('/api/v1/friends/suggested/block')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ userId: user2._id })
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual({ success: true });
      const suggestBlockData = await suggestBlockModel.findOne({ from: activeUser.id, to: user2._id });
      expect(suggestBlockData.reaction).toBe(SuggestBlockReaction.Block);
    });

    describe('Validation', () => {
      it('userId should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/friends/suggested/block')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ userId: '' });
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId should not be empty',
        );
      });

      it('userId must match regular expression', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/friends/suggested/block')
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
