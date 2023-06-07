import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ActivateAccountDto } from 'src/users/dto/user-activate-account.dto';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { RssFeedProvidersService } from '../../../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { rssFeedProviderFactory } from '../../../../factories/rss-feed-providers.factory';
import {
  RssFeedProviderActiveStatus,
  RssFeedProviderAutoFollow,
  RssFeedProviderDeletionStatus,
} from '../../../../../src/schemas/rssFeedProvider/rssFeedProvider.enums';
import {
  RssFeedProviderFollowDocument, RssFeedProviderFollow,
} from '../../../../../src/schemas/rssFeedProviderFollow/rssFeedProviderFollow.schema';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { ActiveStatus } from '../../../../../src/schemas/user/user.enums';
import { WELCOME_MSG } from '../../../../../src/constants';
import { ChatService } from '../../../../../src/chat/providers/chat.service';

describe('Users activate account (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let chatService: ChatService;
  let rssFeedProvidersService: RssFeedProvidersService;
  let rssFeedProvidersFollowModel: Model<RssFeedProviderFollowDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    chatService = moduleRef.get<ChatService>(ChatService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    rssFeedProvidersFollowModel = moduleRef.get<Model<RssFeedProviderFollowDocument>>(getModelToken(RssFeedProviderFollow.name));

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
  });

  describe('POST /api/v1/users/activate-account', () => {
    let user;
    let user1;
    let postBody: ActivateAccountDto;
    beforeEach(async () => {
      const userData = userFactory.build({
        verification_token: uuidv4(),
        status: ActiveStatus.Inactive,
      });
      user = await usersService.create(userData);
      user1 = await usersService.create(userFactory.build());
      postBody = {
        userId: user.id,
        token: user.verification_token,
      };
      for (let i = 0; i < 3; i += 1) {
        await rssFeedProvidersService.create(rssFeedProviderFactory.build({
          auto_follow: RssFeedProviderAutoFollow.Yes,
          status: RssFeedProviderActiveStatus.Active,
          deleted: RssFeedProviderDeletionStatus.NotDeleted,
        }));
      }
      await rssFeedProvidersService.create(rssFeedProviderFactory.build({
        auto_follow: RssFeedProviderAutoFollow.No,
        status: RssFeedProviderActiveStatus.Active,
        deleted: RssFeedProviderDeletionStatus.Deleted,
      }));
    });

    describe('userId and token existence cases', () => {
      it('when userId and token both exist, it successfully activates, creates '
        + 'the expected RssFeedProviderFollow records, and returns the expected response', async () => {
          jest.spyOn(chatService, 'sendPrivateDirectMessage');

          // Spy on the sendPrivateDirectMessage method
          const response = await request(app.getHttpServer())
            .post('/api/v1/users/activate-account')
            .send(postBody)
            .expect(HttpStatus.CREATED);

          // Invoke the code under test
          const userConversationData = await chatService.sendPrivateDirectMessage(user1._id, user._id, WELCOME_MSG);

          const updatedConversationData = await usersService.addAndUpdateNewConversationId(
            user1._id,
            userConversationData.matchId.toString(),
            );

          expect(updatedConversationData.newConversationIds).toHaveLength(1);
          expect(response.body).toEqual({ success: true });

          // Make sure that expected rss feed provider follows were set
          const idsForExpectedRssFeedProvidersToFollow = (await rssFeedProvidersService.findAllAutoFollowRssFeedProviders())
            .map((rssFeedProviderId) => rssFeedProviderId._id);
          const rssFeedProviderFollowData = await rssFeedProvidersFollowModel.find({
            rssfeedProviderId: { $in: idsForExpectedRssFeedProvidersToFollow },
            userId: user._id,
          });
          expect(rssFeedProviderFollowData).toHaveLength(3);
        });

      it('when userId does not exist, but token does exist, it returns the expected response', async () => {
        postBody.userId = new Types.ObjectId().toString();
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Token is not valid');
      });

      it('when userId does exist, but token does not exist, it returns the expected response', async () => {
        postBody.token = uuidv4();
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Token is not valid');
      });

      it('when neither userId nor token exist, it returns the expected response', async () => {
        postBody.userId = new Types.ObjectId().toString();
        postBody.token = uuidv4();
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Token is not valid');
      });
    });

    describe('Validation', () => {
      it('token should not be empty', async () => {
        postBody.token = '';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'token should not be empty',
        );
      });

      it('userId should not be empty', async () => {
        postBody.userId = '';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('userId should not be empty');
      });

      it('userId is a MongoId', async () => {
        postBody.userId = 'not-a-mongo-id';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId must be a mongodb id',
        );
      });
    });
  });
});
