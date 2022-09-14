import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { UsersService } from './users.service';
import { Connection } from 'mongoose';
import { userFactory } from '../../../test/factories/user.factory';
import { ActiveStatus, UserDocument } from '../../schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

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
      const user = userFactory.build(
        { status: ActiveStatus.Active },
        { transient: { unhashedPassword: 'TestPassword' } },
      );
      user.verification_token = uuidv4();
      const userDocument = await usersService.create(user);
      expect(await usersService.findById(userDocument._id)).toBeTruthy();
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

    it('finds the expected user using the same-case email', async () => {
      expect((await usersService.findByEmail(user.email))._id).toEqual(
        user._id,
      );
    });

    it('finds the expected user using a lower-case variant of the email', async () => {
      expect(
        (await usersService.findByEmail(user.email.toLowerCase()))._id,
      ).toEqual(user._id);
    });

    it('finds the expected user using an upper-case variant of the email', async () => {
      expect(
        (await usersService.findByEmail(user.email.toUpperCase()))._id,
      ).toEqual(user._id);
    });
  });

  describe('#findByUsername', () => {
    let user: UserDocument;
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build({}, { transient: { unhashedPassword: 'password' } }),
      );
    });

    it('finds the expected user using the same-case userName', async () => {
      expect((await usersService.findByUsername(user.userName))._id).toEqual(
        user._id,
      );
    });

    it('finds the expected user using a lower-case variant of the userName', async () => {
      expect(
        (await usersService.findByUsername(user.userName.toLowerCase()))._id,
      ).toEqual(user._id);
    });

    it('finds the expected user using an upper-case variant of the userName', async () => {
      expect(
        (await usersService.findByUsername(user.userName.toUpperCase()))._id,
      ).toEqual(user._id);
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

  describe('#verificationTokenIsValid', () => {
    let user;
    beforeEach(async () => {
      const userData = userFactory.build(
        {},
        { transient: { unhashedPassword: 'password' } },
      );
      userData['verification_token'] = uuidv4();
      user = await usersService.create(userData);
    });
    it('finds the expected user by email and verification_token', async () => {
      expect(
        await usersService.verificationTokenIsValid(
          user.email,
          user.verification_token,
        ),
      ).toEqual(true);
    });

    it('when email is not exists', async () => {
      const userEmail = 'userTEWST@gmail.com';
      expect(
        await usersService.verificationTokenIsValid(
          userEmail,
          user.verification_token,
        ),
      ).toEqual(false);
    });

    it('when verification_token is not exists', async () => {
      const userVerificationToken = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      expect(
        await usersService.verificationTokenIsValid(
          user.email,
          userVerificationToken,
        ),
      ).toEqual(false);
    });

    it('when verification_token or email is not exists', async () => {
      const userVerificationToken = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      const userEmail = 'userTEWST@gmail.com';
      expect(
        await usersService.verificationTokenIsValid(
          userEmail,
          userVerificationToken,
        ),
      ).toEqual(false);
    });
  });
});
