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
import { FriendsService } from '../../../../../src/friends/providers/friends.service';

describe('User-Follow / get-one-user-follow-data (e2e)', () => {
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

    describe('GET /api/v1/user-follow/:id', () => {
        beforeEach(async () => {
            activeUser = await usersService.create(userFactory.build());
            user1 = await usersService.create(userFactory.build());
            user2 = await usersService.create(userFactory.build());
            activeUserAuthToken = activeUser.generateNewJwtToken(
                configService.get<string>('JWT_SECRET_KEY'),
            );
            await friendsService.createFriendRequest(activeUser._id.toString(), user1._id.toString());
            await friendsService.acceptFriendRequest(activeUser._id.toString(), user1._id.toString());
            await friendsService.createFriendRequest(activeUser._id.toString(), user2._id.toString());
            await friendsService.acceptFriendRequest(activeUser._id.toString(), user2._id.toString());
        });

        it('requires authentication', async () => {
            await request(app.getHttpServer()).get('/api/v1/user-follow/:id').expect(HttpStatus.UNAUTHORIZED);
        });

        describe('Successfully gets data', () => {
            it('can successfully find data of given id', async () => {
                const sendBody = {
                    userId: activeUser._id,
                    followUserId: user1._id,
                    notification: false,
                };
                await request(app.getHttpServer())
                    .put('/api/v1/user-follow/follow-userId')
                    .auth(activeUserAuthToken, { type: 'bearer' })
                    .send(sendBody);

                const response = await request(app.getHttpServer())
                    .get(`/api/v1/user-follow/${user1._id}`)
                    .auth(activeUserAuthToken, { type: 'bearer' })
                    .send();
                expect(response.body).toEqual({ success: true });
            });

            it('gives the expected response when data is not existing', async () => {
                const response = await request(app.getHttpServer())
                    .get(`/api/v1/user-follow/${user2._id}`)
                    .auth(activeUserAuthToken, { type: 'bearer' })
                    .send();
                expect(response.status).toEqual(HttpStatus.NOT_FOUND);
                expect(response.body.message).toContain(
                    'Follow user data not found',
                );
            });
        });
    });
});
