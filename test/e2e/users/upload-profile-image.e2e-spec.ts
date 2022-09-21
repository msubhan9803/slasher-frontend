import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user.schema';

describe('Users / Upload Profile image (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();
  });

  describe('POST /users/upload-profile-image', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
    });
    it('responds with true if file upload successful', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/upload-profile-image')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .attach('file', './uploads/BlackMarble_2016_928m_asia_east_labeled.png')
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        success: true,
      });
    });

    it('responds expected response when file is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/upload-profile-image')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .attach('file', null)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('Please select the file');
    });

    it('responds expected response when file is not jpg, jpeg or png', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/upload-profile-image')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .attach('file', './uploads/14565c4a-fdd0-4797-8e93-efcae9962581.zip')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('Please select the jpg, jpeg or png');
    });

    it('responds expected response if file size should not larger than 20MB', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/upload-profile-image')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .attach('file', './uploads/a8c933ab-ddba-4535-a23f-c8527f0251fe.png')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('File size should not larger than 20MB');
    });
  });
});
