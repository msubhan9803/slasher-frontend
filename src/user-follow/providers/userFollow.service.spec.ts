import { INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { Test } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { UserFollowService } from './userFollow.service';
import { AppModule } from '../../app.module';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { UsersService } from '../../users/providers/users.service';
import { userFactory } from '../../../test/factories/user.factory';
import { UserFollow, UserFollowDocument } from '../../schemas/userFollow/userFollow.schema';

describe('UserFollowService', () => {
    let app: INestApplication;
    let connection: Connection;
    let userFollowService: UserFollowService;
    let usersService: UsersService;
    let userFollowModel: Model<UserFollowDocument>;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        connection = moduleRef.get<Connection>(getConnectionToken());
        userFollowModel = moduleRef.get<Model<UserFollowDocument>>(getModelToken(UserFollow.name));
        userFollowService = moduleRef.get<UserFollowService>(UserFollowService);
        usersService = moduleRef.get<UsersService>(UsersService);
        app = moduleRef.createNestApplication();
        configureAppPrefixAndVersioning(app);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });
    let user1; let user2; let user3; let user4;

    beforeEach(async () => {
        // Drop database so we start fresh before each test
        await clearDatabase(connection);

        // Reset sequences so we start fresh before each test
        rewindAllFactories();
        user1 = await usersService.create(userFactory.build());
        user2 = await usersService.create(userFactory.build());
        user3 = await usersService.create(userFactory.build());
        user4 = await usersService.create(userFactory.build());
    });

    it('should be defined', () => {
        expect(userFollowService).toBeDefined();
    });

    describe('#create', () => {
        it('successfully creates a user-follow data', async () => {
            const userFollow = await userFollowService.createOrUpdate(user1._id.toString(), user2._id.toString(), true);
            expect(await userFollowModel.findOne({ _id: userFollow._id })).toBeTruthy();
        });

        it('successfully updates the existing user-follow data', async () => {
            const userFollow = await userFollowService.createOrUpdate(user1._id.toString(), user2._id.toString(), true);
            expect(userFollow.pushNotifications).toBe(true);
            //set notification:false
            const userFollow1 = await userFollowService.createOrUpdate(user1._id.toString(), user2._id.toString(), false);
            expect(userFollow1.pushNotifications).toBe(false);
        });
    });

    describe('#findByFollowUser', () => {
        it('finds the data by followUserId and userId', async () => {
            const userFollow1 = await userFollowService.createOrUpdate(user1._id.toString(), user2._id.toString(), true);
            const userFollow2 = await userFollowService.createOrUpdate(user2._id.toString(), user3._id.toString(), false);

            expect((await userFollowService.findFollowUserData(user1.id, user2.id))._id).toEqual(userFollow1._id);
            expect((await userFollowService.findFollowUserData(user2.id, user3.id))._id).toEqual(userFollow2._id);
        });
    });

    describe('findAllFollowUser', () => {
        it('finds all the users and gave the expected response', async () => {
            await userFollowService.createOrUpdate(user1._id.toString(), user3._id.toString(), true);
            await userFollowService.createOrUpdate(user2._id.toString(), user3._id.toString(), true);
            await userFollowService.createOrUpdate(user2._id.toString(), user4._id.toString(), true);
            await userFollowService.createOrUpdate(user1._id.toString(), user4._id.toString(), true);
            expect((await userFollowService.findAllFollowUser(user1.id))).toHaveLength(2);
            expect((await userFollowService.findAllFollowUser(user2.id))).toHaveLength(2);
        });
    });

    describe('#delete', () => {
        it('successfully deletes the data of given id', async () => {
            const userFollow = await userFollowService.createOrUpdate(user1._id.toString(), user2._id.toString(), true);
            await userFollowService.delete(userFollow.id);
            const followData = await userFollowService.findFollowUserData(user1.id, user2.id);
            expect(followData).toBeNull();
        });
    });

    describe('#findAllUsersForFollowNotification', () => {
        it('finds all the users and gave the expected response', async () => {
            await userFollowService.createOrUpdate(user2._id.toString(), user1._id.toString(), true);
            await userFollowService.createOrUpdate(user3._id.toString(), user1._id.toString(), true);
            await userFollowService.createOrUpdate(user4._id.toString(), user1._id.toString(), true);
            expect((await userFollowService.findAllUsersForFollowNotification(user1.id))).toHaveLength(3);
        });
    });

    describe('#deleteFollowDataOnUnfriend', () => {
        it('successfully deletes all follow data of given user id', async () => {
            await userFollowService.createOrUpdate(user2._id.toString(), user1._id.toString(), true);
            await userFollowService.createOrUpdate(user1._id.toString(), user2._id.toString(), true);
            await userFollowService.deleteFollowDataOnUnfriend(user1._id.toString(), user2._id.toString());
            expect(await userFollowService.findFollowUserData(user1._id.toString(), user2._id.toString())).toBeNull();
            expect(await userFollowService.findFollowUserData(user2._id.toString(), user1._id.toString())).toBeNull();
        });
    });
});
