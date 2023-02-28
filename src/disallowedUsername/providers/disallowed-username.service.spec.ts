import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { AppModule } from '../../app.module';
import { DisallowedUsernameService } from './disallowed-username.service';
import { DisallowedUsername, DisallowedUsernameDocument } from '../../schemas/disallowedUsername/disallowedUsername.schema';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';

describe('DisallowedUsernameService', () => {
  let app: INestApplication;
  let connection: Connection;
  let disallowedUsernameService: DisallowedUsernameService;
  let disallowedUsernameModel: Model<DisallowedUsernameDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    disallowedUsernameService = moduleRef.get<DisallowedUsernameService>(DisallowedUsernameService);
    disallowedUsernameModel = moduleRef.get<Model<DisallowedUsernameDocument>>(getModelToken(DisallowedUsername.name));
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
  });

  it('should be defined', () => {
    expect(DisallowedUsernameService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a disallowed username', async () => {
      const disallowedUsername = await disallowedUsernameService.create({
        username: 'testuser',
      });
      expect(await disallowedUsernameModel.findOne({ _id: disallowedUsername._id })).toBeTruthy();
    });
  });

  describe('#update', () => {
    let disallowedUsernameData;
    beforeEach(async () => {
      disallowedUsernameData = await disallowedUsernameService.create(
        {
          username: 'testuser',
        },
      );
    });
    it('finds the expected disallowed username and update the details', async () => {
      const disallowedUsernameUpdateData = {
        username: 'testuser1',
      };
      const updatedDisallowedUsername = await disallowedUsernameService.update(disallowedUsernameData._id, disallowedUsernameUpdateData);
      const reloadedDisallowedUsername = await disallowedUsernameModel.findById(updatedDisallowedUsername._id);
      expect(reloadedDisallowedUsername.username).toEqual(disallowedUsernameUpdateData.username);
    });
  });

  describe('#delete', () => {
    it('delete disallowed username details', async () => {
      const disallowedUsername = await disallowedUsernameService.create({
        username: 'testuser',
      });
      await disallowedUsernameService.delete(disallowedUsername.id);
      const disallowedUsernameDetails = await disallowedUsernameModel.findById(disallowedUsername._id);
      expect(disallowedUsernameDetails).toBeNull();
    });
  });

  describe('#findUserName', () => {
    let disallowedUsername;
    beforeEach(async () => {
      disallowedUsername = await disallowedUsernameService.create({
        username: 'TestUser',
      });
    });

    it('finds the expected disallowedUsername using the same-case userName', async () => {
      expect((await disallowedUsernameService.findUserName(disallowedUsername.username))._id).toEqual(
        disallowedUsername._id,
      );
    });

    it('finds the expected disallowedUsername using a lower-case variant of the userName', async () => {
      expect(
        (await disallowedUsernameService.findUserName(disallowedUsername.username.toLowerCase()))._id,
      ).toEqual(disallowedUsername._id);
    });

    it('finds the expected disallowedUsername using an upper-case variant of the userName', async () => {
      expect(
        (await disallowedUsernameService.findUserName(disallowedUsername.username.toUpperCase()))._id,
      ).toEqual(disallowedUsername._id);
    });
  });
});
