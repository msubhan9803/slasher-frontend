import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { ChangePasswordDto } from '../../../src/users/dto/change-password.dto';
import { User } from '../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../helpers/mongo-helpers';

describe('Users change password (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let configService: ConfigService;
  let activeUserAuthToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
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

  describe('PATCH /users/change-password', () => {
    let user: User;
    let postBody: ChangePasswordDto;
    beforeEach(async () => {
      user = await usersService.create(userFactory.build());
      activeUserAuthToken = user.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
      postBody = {
        currentPassword: 'password',
        newPassword: 'User@12345',
        newPasswordConfirmation: 'User@12345',
      };
    });

    describe('Change Password', () => {
      it('Password change successfully, and new password is stored in the db', async () => {
        const response = await request(app.getHttpServer())
          .patch('/api/v1/users/change-password')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(
          bcrypt.compareSync(
            postBody.newPassword,
            (await usersService.findById(user._id.toString())).password,
          ),
        ).toBe(true);
      });
    });

    describe('Validation', () => {
      it('currentPassword should not be empty', async () => {
        postBody.currentPassword = '';
        const response = await request(app.getHttpServer())
          .patch('/api/v1/users/change-password')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'currentPassword should not be empty',
        );
      });

      it('newPassword should not be empty', async () => {
        postBody.newPassword = '';
        const response = await request(app.getHttpServer())
          .patch('/api/v1/users/change-password')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('newPassword should not be empty');
      });

      it('newPasswordConfirmation should not be empty', async () => {
        postBody.newPasswordConfirmation = '';
        const response = await request(app.getHttpServer())
          .patch('/api/v1/users/change-password')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'newPasswordConfirmation should not be empty',
        );
      });

      it('newPassword should match pattern', async () => {
        postBody.newPassword = 'testuser123';
        const response = await request(app.getHttpServer())
          .patch('/api/v1/users/change-password')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'Password must be at least 8 characters long, contain at least one (1) '
          + 'capital letter, and contain at least one (1) special character.',
        );
      });

      it('newPassword and newPasswordConfirmation match', async () => {
        postBody.newPasswordConfirmation = 'TestUser@1234';
        const response = await request(app.getHttpServer())
          .patch('/api/v1/users/change-password')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message[0]).toContain(
          'newPasswordConfirmation must match newPassword exactly',
        );
      });
    });
  });
});
