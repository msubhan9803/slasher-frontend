import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { UserDocument, User } from '../../schemas/user.schema';
import { UsersService } from './users.service';
import { Model } from 'mongoose';
import { truncateAllCollections } from '../../../test/test-helpers';

describe('UsersService', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    userModel = moduleRef.get<Model<UserDocument>>(getModelToken(User.name));

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Truncate all db collections so we start fresh before each test
    await truncateAllCollections(userModel);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a user', () => {
      // TODO
    });
  });

  describe('#findAll', () => {
    it('finds the expected set of users', () => {
      // TODO
    });
  });

  describe('#findByEmail', () => {
    it('finds the expected user', () => {
      // TODO
    });
  });

  describe('#findByUsername', () => {
    it('finds the expected user', () => {
      // TODO
    });
  });

  describe('#findByEmailOrUsername', () => {
    it('finds the expected user', () => {
      // TODO
    });
  });
});
