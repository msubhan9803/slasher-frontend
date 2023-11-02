import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { Test } from '@nestjs/testing';
import { Job } from 'bull';
import { getConnectionToken } from '@nestjs/mongoose';
import { UserDocument } from '../../schemas/user/user.schema';
import { UsersService } from '../../users/providers/users.service';
import { DeleteUserDataConsumer } from './user-delete-data.consumer';
import { AppModule } from '../../app.module';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { userFactory } from '../../../test/factories/user.factory';

describe('#message-count-update', () => {
    let app: INestApplication;
    let connection: Connection;
    let activeUser: UserDocument;
    let usersService: UsersService;
    let deleteUserDataConsumer: DeleteUserDataConsumer;
    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      })
        .compile();
      connection = await moduleRef.get<Connection>(getConnectionToken());
      usersService = moduleRef.get<UsersService>(UsersService);
      deleteUserDataConsumer = moduleRef.get(DeleteUserDataConsumer);
      app = moduleRef.createNestApplication();
    });
    afterAll(async () => app.close());
    beforeEach(async () => {
      // Drop database so we start fresh before each test
      await clearDatabase(connection);
      // Reset sequences so we start fresh before each test
      rewindAllFactories();
      activeUser = await usersService.create(userFactory.build());
    });
    describe('should delete all data of user with appropriate userId', () => {
      it('adds a job', async () => {
        const response = await deleteUserDataConsumer.deleteUserData({ data: { userId: activeUser._id.toString() } } as Job);
        expect(response).toEqual({ success: true });
      });
    });
  });
