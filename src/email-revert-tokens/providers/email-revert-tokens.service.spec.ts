/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Types } from 'mongoose';
import { DateTime } from 'luxon';
import { userFactory } from '../../../test/factories/user.factory';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { AppModule } from '../../app.module';
import { UsersService } from '../../users/providers/users.service';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { EmailRevertTokensService } from './email-revert-tokens.service';
import { UserDocument } from '../../schemas/user/user.schema';

describe('EmailRevertTokensService', () => {
  let app: INestApplication;
  let connection: Connection;
  let emailRevertTokensService: EmailRevertTokensService;
  let usersService: UsersService;
  let user: UserDocument;
  const tokenValue = '12345';
  const emailToRevertTo = 'revert.to.this@example.com';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    emailRevertTokensService = moduleRef.get<EmailRevertTokensService>(EmailRevertTokensService);
    usersService = moduleRef.get<UsersService>(UsersService);

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

    user = await usersService.create(userFactory.build());
  });

  it('should be defined', () => {
    expect(emailRevertTokensService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a new record', async () => {
      expect(await emailRevertTokensService.create(user.id, tokenValue, emailToRevertTo)).toBeTruthy();
    });
  });

  describe('#findToken', () => {
    const dateInThePast = DateTime.now().minus({ days: 1 }).toJSDate();
    const dateInTheFuture = DateTime.now().plus({ days: 1 }).toJSDate();
    let emailRevertToken;

    beforeEach(async () => {
      emailRevertToken = await emailRevertTokensService.create(user.id, tokenValue, emailToRevertTo);
    });

    it('successfully finds a record when applicable arguments are given', async () => {
      const foundEmailRevertToken = await emailRevertTokensService.findToken(user.id, tokenValue, dateInThePast);
      expect(foundEmailRevertToken.id).toEqual(emailRevertToken.id);
    });

    it('does not find the EmailRevertToken when no record exists for the given userId', async () => {
      const nonExistentObjectId = new Types.ObjectId();
      const foundEmailRevertToken = await emailRevertTokensService.findToken(nonExistentObjectId.toString(), tokenValue, dateInThePast);
      expect(foundEmailRevertToken).toBeNull();
    });

    it('does not find the EmailRevertToken when no record exists for the given token value', async () => {
      const foundEmailRevertToken = await emailRevertTokensService.findToken(user.id, 'invalid-token-value', dateInThePast);
      expect(foundEmailRevertToken).toBeNull();
    });

    it('does not find the EmailRevertToken for a token with a createdAt date earlier than the createdAfter argument', async () => {
      const foundEmailRevertToken = await emailRevertTokensService.findToken(user.id, tokenValue, dateInTheFuture);
      expect(foundEmailRevertToken).toBeNull();
    });
  });

  describe('#deleteToken', () => {
    const dateInThePast = DateTime.now().minus({ days: 1 }).toJSDate();
    let userRevertToken1;
    let userRevertToken2;
    let userRevertToken3;
    let otherUser;
    let otherUserRevertToken;

    beforeEach(async () => {
      otherUser = await usersService.create(userFactory.build());
      userRevertToken1 = await emailRevertTokensService.create(user.id, '0000-0000-0000-0001', emailToRevertTo);
      userRevertToken2 = await emailRevertTokensService.create(user.id, '0000-0000-0000-0002', emailToRevertTo);
      userRevertToken3 = await emailRevertTokensService.create(user.id, '0000-0000-0000-0003', emailToRevertTo);
      otherUserRevertToken = await emailRevertTokensService.create(otherUser.id, '0000-0000-0000-0004', 'other-user@example.com');
    });

    it('deletes the token and all future tokens, but not any past tokens or tokens for other users', async () => {
      await emailRevertTokensService.deleteTokenAndLaterIssuedTokens(user.id, userRevertToken2.value);
      expect(await emailRevertTokensService.findToken(user.id, userRevertToken1.value, dateInThePast)).toBeTruthy();
      expect(await emailRevertTokensService.findToken(user.id, userRevertToken2.value, dateInThePast)).toBeNull();
      expect(await emailRevertTokensService.findToken(user.id, userRevertToken3.value, dateInThePast)).toBeNull();
      expect(await emailRevertTokensService.findToken(otherUser.id, otherUserRevertToken.value, dateInThePast)).toBeTruthy();
    });
  });
});
