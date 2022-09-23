import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../../app.module';
import { UsersService } from './users.service';
import { userFactory } from '../../../test/factories/user.factory';
import { UserDocument } from '../../schemas/user.schema';
import { ActiveStatus } from '../../schemas/user.enums';

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
      const userData = userFactory.build(
        { status: ActiveStatus.Active },
      );
      userData.verification_token = uuidv4();
      const user = await usersService.create(userData);
      expect(await usersService.findById(user._id)).toBeTruthy();
    });
  });

  describe('#findAll', () => {
    beforeEach(async () => {
      await usersService.create(
        userFactory.build(),
      );
      await usersService.create(
        userFactory.build(),
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
        userFactory.build(),
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
        userFactory.build(),
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
        userFactory.build(),
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

  describe('#validatePasswordResetToken', () => {
    let user;
    beforeEach(async () => {
      const userData = userFactory.build();
      userData.resetPasswordToken = uuidv4();
      user = await usersService.create(userData);
    });
    it('returns true when user email and resetPasswordToken are found', async () => {
      expect(
        await usersService.resetPasswordTokenIsValid(
          user.email,
          user.resetPasswordToken,
        ),
      ).toBe(true);
    });

    it('returns true when user email does not exist', async () => {
      const userEmail = 'non-existing@gmail.com';
      expect(
        await usersService.resetPasswordTokenIsValid(
          userEmail,
          user.resetPasswordToken,
        ),
      ).toBe(false);
    });
    it('returns false when resetPasswordToken does not exist', async () => {
      const userResetPasswordToken = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      expect(
        await usersService.resetPasswordTokenIsValid(
          user.email,
          userResetPasswordToken,
        ),
      ).toBe(false);
    });

    it('returns false when neither user nor resetPasswordToken exist', async () => {
      const userResetPasswordToken = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      const userEmail = 'non-existing@gmail.com';
      expect(
        await usersService.resetPasswordTokenIsValid(
          userEmail,
          userResetPasswordToken,
        ),
      ).toBe(false);
    });
  });

  describe('#verificationTokenIsValid', () => {
    let user;
    beforeEach(async () => {
      const userData = userFactory.build();
      userData.verification_token = uuidv4();
      user = await usersService.create(userData);
    });
    it('finds the expected user by email and verification_token', async () => {
      expect(
        await usersService.verificationTokenIsValid(
          user.email,
          user.verification_token,
        ),
      ).toBe(true);
    });

    it('returns false when email does not exist', async () => {
      const userEmail = 'non-existinging-user@gmail.com';
      expect(
        await usersService.verificationTokenIsValid(
          userEmail,
          user.verification_token,
        ),
      ).toBe(false);
    });

    it('returns false when verification_token does not exist', async () => {
      const userVerificationToken = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      expect(
        await usersService.verificationTokenIsValid(
          user.email,
          userVerificationToken,
        ),
      ).toBe(false);
    });

    it('when verification_token or email is not exists', async () => {
      const userVerificationToken = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      const userEmail = 'non-existinging-user@gmail.com';
      expect(
        await usersService.verificationTokenIsValid(
          userEmail,
          userVerificationToken,
        ),
      ).toBe(false);
    });
  });

  describe('#getSuggestedFriends', () => {
    let user;
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build(),
      );
      for (let i = 0; i < 7; i += 1) {
        await usersService.create(
          userFactory.build(),
        );
      }
    });
    it('finds the expected number of users when the requested number is higher than the number available, '
      + 'and does not incude passed-in user among the set', async () => {
        const suggestedFriends = await usersService.getSuggestedFriends(user, 9); // ask for up to 9 users
        expect(suggestedFriends).toHaveLength(7); // but there should only be 7 returned
        expect(suggestedFriends.map((friend) => friend._id)).not.toContain(user._id);
      });

    it('returns the expected number of users when the requested number equals the number available', async () => {
      const suggestedFriends = await usersService.getSuggestedFriends(user, 7);
      expect(suggestedFriends).toHaveLength(7);
    });

    it('returns the expected number of users when the requested number is lower than the number available', async () => {
      const suggestedFriends = await usersService.getSuggestedFriends(user, 5);
      expect(suggestedFriends).toHaveLength(5);
    });
  });

  describe('#update', () => {
    let user;
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build(),
      );
    });
    it('finds the expected user and update the details', async () => {
      const userData = {
        firstName: 'Test1 User',
        userName: 'test1_user',
      };
      const updatedUser = await usersService.update(user._id, userData);
      const reloadedUser = await usersService.findById(updatedUser._id);
      expect(reloadedUser.firstName).toEqual(userData.firstName);
      expect(reloadedUser.userName).toEqual(userData.userName);
      expect(reloadedUser.email).toEqual(user.email);
    });
  });
});
