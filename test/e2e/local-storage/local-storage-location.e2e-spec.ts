import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user.schema';
import { createTempFile } from '../../helpers/tempfile-helpers';
import { LocalStorageService } from '../../../src/local-storage/providers/local-storage.service';

describe('Local-Storage / Get File (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let localStorageService: LocalStorageService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    localStorageService = moduleRef.get<LocalStorageService>(LocalStorageService);
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

  describe('GET /local-storage/:location', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
    });
    it('responds with file if give file path exists', async () => {
      const fileExtension = 'jpg';
      const storedFileName = `${uuidv4()}.${fileExtension}`;
      await createTempFile(async (tempPath) => {
        const file: Express.Multer.File = { path: tempPath } as Express.Multer.File;
        const storagePath = 'profile_test/';
        const fileName = `profile_test_${storedFileName}`;
        localStorageService.write(`/${storagePath}`, fileName, file);

        await request(app.getHttpServer())
          .get(`/local-storage/${storagePath}${fileName}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.OK);
      }, { extension: 'png' });
    });

    it('responds expected response when file path is not present at requested path', async () => {
      const storagePath = 'profile_test/profile_test_1.jpg';

      const response = await request(app.getHttpServer())
          .get(`/local-storage/${storagePath}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toContain('File not found');
    });
  });
});
