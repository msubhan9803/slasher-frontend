import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../../../../src/app.module';
import { User } from '../../../../../src/schemas/user/user.schema';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { userFactory } from '../../../../factories/user.factory';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { FriendsService } from '../../../../../src/friends/providers/friends.service';

describe('User-Follow / create-user-follow (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let activeUserAuthToken: string;
    let activeUser: User;
    let user1: User;
    let user2: User;
    let configService: ConfigService;
    let usersService: UsersService;
    let friendsService: FriendsService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        connection = moduleRef.get<Connection>(getConnectionToken());
        usersService = moduleRef.get<UsersService>(UsersService);
        configService = moduleRef.get<ConfigService>(ConfigService);
        friendsService = moduleRef.get<FriendsService>(FriendsService);
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

    describe('PUT /api/v1/user-follow/follow-userId', () => {
        beforeEach(async () => {
            activeUser = await usersService.create(userFactory.build());
            user1 = await usersService.create(userFactory.build());
            user2 = await usersService.create(userFactory.build());
            activeUserAuthToken = activeUser.generateNewJwtToken(
                configService.get<string>('JWT_SECRET_KEY'),
            );
            await friendsService.createFriendRequest(activeUser._id.toString(), user1._id.toString());
            await friendsService.acceptFriendRequest(activeUser._id.toString(), user1._id.toString());
        });

        it('requires authentication', async () => {
            await request(app.getHttpServer()).put('/api/v1/user-follow/follow-userId').expect(HttpStatus.UNAUTHORIZED);
        });

        describe('Successfully follows', () => {
            it('can successfully creates the follow user with given data', async () => {
                const sendBody = {
                    userId: activeUser._id,
                    followUserId: user1._id,
                    notification: true,
                };
                const response = await request(app.getHttpServer())
                    .put('/api/v1/user-follow/follow-userId')
                    .auth(activeUserAuthToken, { type: 'bearer' })
                    .send(sendBody)
                    .expect(HttpStatus.OK);

                expect(response.body).toEqual({
                    userId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                    followUserId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                    pushNotifications: true,
                    _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                });
            });

            it('gives the expected error when you try to follow yourself', async () => {
                const sendBody = {
                    userId: activeUser._id,
                    followUserId: activeUser._id,
                    notification: false,
                };
                const response = await request(app.getHttpServer())
                    .put('/api/v1/user-follow/follow-userId')
                    .auth(activeUserAuthToken, { type: 'bearer' })
                    .send(sendBody);
                expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
                expect(response.body.message).toContain(
                    'You can not follow yourself',
                );
            });

            it('updates the data if already exists', async () => {
                const sendBody = {
                    userId: activeUser._id,
                    followUserId: user1._id,
                    notification: false,
                };
                await request(app.getHttpServer())
                    .put('/api/v1/user-follow/follow-userId')
                    .auth(activeUserAuthToken, { type: 'bearer' })
                    .send(sendBody);

                const sendBody1 = {
                    userId: activeUser._id,
                    followUserId: user1._id,
                    notification: false,
                };
                const response = await request(app.getHttpServer())
                    .put('/api/v1/user-follow/follow-userId')
                    .auth(activeUserAuthToken, { type: 'bearer' })
                    .send(sendBody1)
                    .expect(HttpStatus.OK);
                expect(response.body.pushNotifications).toBe(false);
            });

            it('gives the expected error when both users are not friends', async () => {
                const sendBody = {
                    userId: activeUser._id,
                    followUserId: user2._id,
                    notification: true,
                };
                const response = await request(app.getHttpServer())
                    .put('/api/v1/user-follow/follow-userId')
                    .auth(activeUserAuthToken, { type: 'bearer' })
                    .send(sendBody);
                expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
                expect(response.body.message).toContain(
                    'You are not friends',
                );
            });
        });
    });
});
