import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { UsersService } from './users.service';
import { Connection } from 'mongoose';
import { userFactory } from '../../../test/factories/user.factory';
import { ActiveStatus, UserDocument } from '../../schemas/user.schema';

describe('UsersService', () => {
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

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a user', async () => {
      const newUser = userFactory.build(
        { status: ActiveStatus.Active },
        { transient: { unhashedPassword: 'TestPassword' } },
      );
      const userDetail = await usersService.create(newUser);
      expect(userDetail.email).toBe(newUser.email);
    });
  });

  describe('#findAll', () => {
    beforeEach(async () => {
      await usersService.create(
        userFactory.build({}, { transient: { unhashedPassword: 'password' } }),
      );
      await usersService.create(
        userFactory.build({}, { transient: { unhashedPassword: 'password' } }),
      );
    });
    it('finds the expected set of users', async () => {
      expect(await usersService.findAll(1, 10)).toHaveLength(2);
    });
  });

  describe('#findByEmail', () => {
    let user: UserDocument;
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build({}, { transient: { unhashedPassword: 'password' } }),
      );
    });
    it('finds the expected user', async () => {
      // TODO
      expect((await usersService.findByEmail(user.email))._id).toEqual(
        user._id,
      );
    });
  });

  describe('#findByUsername', () => {
    let user: UserDocument;
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build({}, { transient: { unhashedPassword: 'password' } }),
      );
    });
    it('finds the expected user', async () => {
      expect((await usersService.findByUsername(user.userName))._id).toEqual(
        user._id,
      );
    });
  });

  describe('#findByEmailOrUsername', () => {
    let user;
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build({}, { transient: { unhashedPassword: 'password' } }),
      );
    });
    it('finds the expected user by email', async () => {
      expect(
        (await usersService.findByEmailOrUsername(user.email))._id,
      ).toEqual(user._id);
    });
    it('finds the expected user by userName', async () => {
      expect(
        (await usersService.findByEmailOrUsername(user.userName))._id,
      ).toEqual(user._id);
    });
  });
});
