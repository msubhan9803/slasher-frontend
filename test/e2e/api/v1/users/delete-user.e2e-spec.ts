import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose, { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { userFactory } from '../../../../factories/user.factory';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { UserType } from '../../../../../src/schemas/user/user.enums';

describe('Users / delete user (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let alreadyDeletedUser: UserDocument;
  let nonAdminUser: UserDocument;
  let adminUser: UserDocument;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);

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
    alreadyDeletedUser = await usersService.create(userFactory.build({ deleted: true }));
    nonAdminUser = await usersService.create(userFactory.build());
    adminUser = await usersService.create(userFactory.build({ userType: UserType.Admin }));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('DELETE /api/v1/users/:userId', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).delete(`/api/v1/users/${activeUser.id}`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('delete account request', () => {
      it('succeeds when a user tries to delete their own account', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/users/${activeUser.id}?confirmUserId=${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({ success: true });
      });

      it('fails if a non-admin user tries to delete a different user', async () => {
        const nonAdminUserAuthToken = nonAdminUser.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/users/${user1.id}?confirmUserId=${user1.id}`)
          .auth(nonAdminUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({ statusCode: 403, message: 'You are not allowed to perform this action.' });
      });

      it('succeeds if an admin user tries to delete a different user', async () => {
        const adminUserAuthToken = adminUser.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/users/${user1.id}?confirmUserId=${user1.id}`)
          .auth(adminUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({ success: true });
      });

      it('returns the expected response if admin tries to delete a non-existent user', async () => {
        const adminUserAuthToken = adminUser.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));

        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/users/${nonExistentId}?confirmUserId=${nonExistentId}`)
          .auth(adminUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({ statusCode: HttpStatus.NOT_FOUND, message: 'User not found.' });
      });

      it('succeeds if an admin user tries to delete an already deleted user', async () => {
        const adminUserAuthToken = adminUser.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/users/${alreadyDeletedUser.id}?confirmUserId=${alreadyDeletedUser.id}`)
          .auth(adminUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({ success: true });
      });

      it('returns the expected error if query parameter confirmUserId different than the userId user param', async () => {
        const userId = user1._id;
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/users/${activeUser.id}?confirmUserId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain("Supplied confirmUserId param does not match user's id.");
      });
    });

    describe('Validation', () => {
      it('confirmUserId should not be empty', async () => {
        const userId = '';
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/users/${activeUser.id}?confirmUserId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'confirmUserId should not be empty',
        );
      });

      it('confirmUserId must be a mongodb id', async () => {
        const userId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/users/${activeUser.id}?confirmUserId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'confirmUserId must be a mongodb id',
        );
      });
    });
  });
});
