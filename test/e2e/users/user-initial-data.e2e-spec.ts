import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user.schema';

describe('Users suggested friends (e2e)', () => {
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

  describe('GET /users/initial-data', () => {
    describe('Available user initial data in the database', () => {
      beforeEach(async () => {
        activeUser = await usersService.create(userFactory.build());
        activeUserAuthToken = activeUser.generateNewJwtToken(
          configService.get<string>('JWT_SECRET_KEY'),
        );
      });
      it('returns the expected user initial data', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/initial-data')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          userName: activeUser.userName,
          notificationCount: 6,
          recentMessages: [
            {
              profilePic: 'https://i.pravatar.cc/300?img=47',
              userName: 'MaureenBiologist',
              shortMessage: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse interdum, tortor vel consectetur blandit,'
                + 'justo diam elementum massa, id tincidunt risus turpis non nisi. Integer eu lorem risus.',
            },
            {
              profilePic: 'https://i.pravatar.cc/300?img=56',
              userName: 'TeriDactyl',
              shortMessage: 'Maecenas ornare sodales mi, sit amet pretium eros scelerisque quis.'
                + 'Nunc blandit mi elit, nec varius erat hendrerit ac. Nulla congue sollicitudin eleifend.',
            },
            {
              profilePic: 'https://i.pravatar.cc/300?img=26',
              userName: 'BobRoss',
              shortMessage: 'Aenean luctus ac magna lobortis varius. Ut laoreet arcu ac commodo molestie. Nulla facilisi.'
                + 'Sed porta sit amet nunc tempus sollicitudin. Pellentesque ac lectus pulvinar, pulvinar diam sed, semper libero.',
            },
          ],
          friendRequests: [
            {
              profilePic: 'https://i.pravatar.cc/300?img=12',
              userName: 'JackSkellington',
            },
            {
              profilePic: 'https://i.pravatar.cc/300?img=19',
              userName: 'Sally',
            },
            {
              profilePic: 'https://i.pravatar.cc/300?img=17',
              userName: 'OogieBoogie',
            },
          ],
        });
      });
    });
  });
});
