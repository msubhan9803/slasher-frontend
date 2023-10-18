import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Hide Friendship Model (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let usersService: UsersService;
    let activeUserAuthToken: string;
    let activeUser: UserDocument;
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

    describe('PUT /api/v1/users/ignoreFriendSuggestionDialog', () => {
        it('requires authentication', async () => {
            await request(app.getHttpServer()).put('/api/v1/users/ignoreFriendSuggestionDialog').expect(HttpStatus.UNAUTHORIZED);
        });

        describe('ignore FriendSuggestion Dialog', () => {
            beforeEach(async () => {
                activeUser = await usersService.create(userFactory.build({
                    profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
                }));
                activeUserAuthToken = activeUser.generateNewJwtToken(
                    configService.get<string>('JWT_SECRET_KEY'),
                );
            });
            it('successfully updates the user data', async () => {
                const response = await request(app.getHttpServer())
                    .put('/api/v1/users/ignoreFriendSuggestionDialog')
                    .auth(activeUserAuthToken, { type: 'bearer' })
                    .send();
                expect(response.status).toEqual(HttpStatus.OK);
                expect(response.body).toEqual({ success: true });
            });
        });
    });
});
