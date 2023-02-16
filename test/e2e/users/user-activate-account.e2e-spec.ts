import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ActivateAccountDto } from 'src/users/dto/user-activate-account.dto';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { RssFeedProvidersService } from '../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { rssFeedProviderFactory } from '../../factories/rss-feed-providers.factory';
import {
  RssFeedProviderActiveStatus,
  RssFeedProviderAutoFollow,
  RssFeedProviderDeletionStatus,
} from '../../../src/schemas/rssFeedProvider/rssFeedProvider.enums';
import {
  RssFeedProviderFollowDocument, RssFeedProviderFollow,
} from '../../../src/schemas/rssFeedProviderFollow/rssFeedProviderFollow.schema';

describe('Users activate account (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let rssFeedProvidersService: RssFeedProvidersService;
  let rssFeedProvidersFollowModel: Model<RssFeedProviderFollowDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    rssFeedProvidersFollowModel = moduleRef.get<Model<RssFeedProviderFollowDocument>>(getModelToken(RssFeedProviderFollow.name));

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
  });

  describe('POST /users/activate-account', () => {
    let user;
    let postBody: ActivateAccountDto;
    beforeEach(async () => {
      const userData = userFactory.build();
      userData.verification_token = uuidv4();
      user = await usersService.create(userData);
      postBody = {
        email: user.email,
        verification_token: user.verification_token,
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

    describe('Email and verification_token existence cases', () => {
      it('when email and verification_token both exist, it successfully activates, creates '
        + 'the expected RssFeedProviderFollow records, and returns the expected response', async () => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/users/activate-account')
            .send(postBody)
            .expect(HttpStatus.CREATED);
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

      it('when email does not exist, but verification_token does exist, it returns the expected response', async () => {
        postBody.email = 'usertestuser@gmail.com';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Token is not valid');
      });

      it('when email does exist, but verification_token does not exist, it returns the expected response', async () => {
        postBody.verification_token = uuidv4();
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Token is not valid');
      });

      it('when neither email nor verification_token exist, it returns the expected response', async () => {
        postBody.email = 'postBodytestuser@gmail.com';
        postBody.verification_token = uuidv4();
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Token is not valid');
      });
    });

    describe('Validation', () => {
      it('verification_token should not be empty', async () => {
        postBody.verification_token = '';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'verification_token should not be empty',
        );
      });

      it('email should not be empty', async () => {
        postBody.email = '';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('email should not be empty');
      });

      it('email is a proper-form email', async () => {
        postBody.email = 'testuserpostbodygmail.com';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'email must be a valid-format email',
        );
      });
    });
  });
});
