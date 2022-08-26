import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { UsersService } from './users.service';
import { Connection } from 'mongoose';

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
