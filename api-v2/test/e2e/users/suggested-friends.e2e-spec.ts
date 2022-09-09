import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';

describe('Users suggested friends (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
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

  describe('GET /users/suggested-friends', () => {
    beforeEach(async () => {
      for (let i = 0; i < 7; i++) {
        await usersService.create(
          userFactory.build(
            {},
            { transient: { unhashedPassword: 'password' } },
          ),
        );
      }
    });
    describe('Suggested Friends', () => {
      it('Get all suggested friends successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/suggested-friends')
          .send();
        expect(response.body).toHaveLength(7);
      });
    });
  });
});
