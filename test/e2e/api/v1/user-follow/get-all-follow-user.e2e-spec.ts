import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../../../../src/app.module';
import { User } from '../../../../../src/schemas/user/user.schema';
import { UserFollowService } from '../../../../../src/user-follow/providers/userFollow.service';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { userFactory } from '../../../../factories/user.factory';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';

describe('User-Follow / get-all-user-follow (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let activeUserAuthToken: string;
    let user2AuthToken: string;
    let activeUser: User;
    let user1: User;
    let user2: User;
    let user3: User;
    let configService: ConfigService;
    let usersService: UsersService;
    let userFollowService: UserFollowService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        connection = moduleRef.get<Connection>(getConnectionToken());
        usersService = moduleRef.get<UsersService>(UsersService);
        configService = moduleRef.get<ConfigService>(ConfigService);
        userFollowService = moduleRef.get<UserFollowService>(UserFollowService);

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

    describe('GET /api/v1/user-follow/fetch-all-follow-user', () => {
        beforeEach(async () => {
            activeUser = await usersService.create(userFactory.build());
            user1 = await usersService.create(userFactory.build());
            user2 = await usersService.create(userFactory.build());
            user3 = await usersService.create(userFactory.build());
            activeUserAuthToken = activeUser.generateNewJwtToken(
                configService.get<string>('JWT_SECRET_KEY'),
            );
            user2AuthToken = activeUser.generateNewJwtToken(
                configService.get<string>('JWT_SECRET_KEY'),
            );
        });

        it('requires authentication', async () => {
            await request(app.getHttpServer()).get('/api/v1/user-follow/fetch-all-follow-user').expect(HttpStatus.UNAUTHORIZED);
        });

        describe('Successfully gets all the users', () => {
            it('can successfully gets the all users', async () => {
                await userFollowService.createOrUpdate(activeUser._id.toString(), user1._id.toString(), true);
                await userFollowService.createOrUpdate(activeUser._id.toString(), user2._id.toString(), true);
                await userFollowService.createOrUpdate(activeUser._id.toString(), user3._id.toString(), true);
                const response = await request(app.getHttpServer())
                    .get('/api/v1/user-follow/fetch-all-follow-user')
                    .auth(activeUserAuthToken, { type: 'bearer' })
                    .send();
                expect((response.body)).toHaveLength(3);
                expect(response.body).toEqual(
                    [
                        {
                            userId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                            followUserId: {
                                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                                userName: 'Username2',
                                firstName: 'First name 2',
                                profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
                            },
                            pushNotifications: true,
                        },
                        {
                            userId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                            followUserId: {
                                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                                userName: 'Username3',
                                firstName: 'First name 3',
                                profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
                            },
                            pushNotifications: true,
                        },
                        {
                            userId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                            followUserId: {
                                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                                userName: 'Username4',
                                firstName: 'First name 4',
                                profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
                            },
                            pushNotifications: true,
                        },
                    ],
                );
            });

            it('gives the expected response when no one follows to user2', async () => {
                const response = await request(app.getHttpServer())
                    .get('/api/v1/user-follow/fetch-all-follow-user')
                    .auth(user2AuthToken, { type: 'bearer' })
                    .send();
                expect(response.body).toEqual([]);
            });
        });
    });
});
