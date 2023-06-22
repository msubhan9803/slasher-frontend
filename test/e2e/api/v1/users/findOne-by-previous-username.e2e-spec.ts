import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('GET /users/previous-username/:userName (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let usersService: UsersService;
    let activeUserAuthToken: string;
    let activeUser: UserDocument;
    let user1: UserDocument;
    let configService: ConfigService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        connection = moduleRef.get<Connection>(getConnectionToken());
        usersService = moduleRef.get<UsersService>(UsersService);
        configService = moduleRef.get<ConfigService>(ConfigService);
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

    describe('GET /api/v1/users/previous-username/:userName', () => {
        beforeEach(async () => {
            activeUser = await usersService.create(userFactory.build());
            user1 = await usersService.create(userFactory.build({
                userName: 'slasher2',
                previousUserName: 'Rocky',
            }));
            activeUserAuthToken = activeUser.generateNewJwtToken(
                configService.get<string>('JWT_SECRET_KEY'),
            );
        });

        it('requires authentication', async () => {
            const userId = new mongoose.Types.ObjectId();
            await request(app.getHttpServer()).get(`/api/v1/users/${userId}`).expect(HttpStatus.UNAUTHORIZED);
        });

        describe('Find a user by previousUserName', () => {
            it('returns the expected user', async () => {
                const response = await request(app.getHttpServer())
                    .get(`/api/v1/users/previous-username/${user1.previousUserName}`)
                    .auth(activeUserAuthToken, { type: 'bearer' })
                    .send();
                expect(response.status).toEqual(HttpStatus.OK);
                expect(response.body).toEqual({
                    userName: user1.userName,
                    previousUserName: user1.previousUserName,
                });
            });
        });

        it('returns the expected response when the user is not found', async () => {
            const nonExistentUserName = `No${activeUser.userName}`;
            const response = await request(app.getHttpServer())
                .get(`/api/v1/users/previous-username/${nonExistentUserName}`)
                .auth(activeUserAuthToken, { type: 'bearer' })
                .send();
            expect(response.status).toEqual(HttpStatus.NOT_FOUND);
            expect(response.body).toEqual({
                message: 'User not found',
                statusCode: 404,
            });
        });
    });
});
