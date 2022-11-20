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
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { dropCollections } from '../../helpers/mongo-helpers';

describe('Delete Block (e2e)', () => {
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

    activeUser = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    await blocksModel.create({
      from: activeUser._id,
      to: user1._id,
      reaction: BlockAndUnblockReaction.Block,
    });
  });

  describe('DELETE /blocks', () => {
    describe('Delete Block Request', () => {
      it('delete block successfully.', async () => {
        const userId = user1._id;
        await request(app.getHttpServer())
          .delete(`/blocks?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.OK)
          .expect({ success: true });
        expect(await blocksModel.findOne({ to: user1._id })).toBeNull();
      });
    });
  });

  describe('Validation', () => {
    it('userId should not be empty', async () => {
      const userId = '';
      const response = await request(app.getHttpServer())
        .delete(`/blocks?userId=${userId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain('userId should not be empty');
    });

    it('userId must match regular expression', async () => {
      const userId = 'aaa';
      const response = await request(app.getHttpServer())
        .delete(`/blocks?userId=${userId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain('userId must match /^[a-f\\d]{24}$/i regular expression');
    });
  });
});
