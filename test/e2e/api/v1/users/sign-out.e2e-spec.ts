import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { ConfigService } from '@nestjs/config';
import { DeviceIdDto } from 'src/users/dto/deviceId.dto';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Users sign-out (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let usersService: UsersService;
    let activeUser: UserDocument;
    let activeUserAuthToken: string;
    let configService: ConfigService;
    let postBody: DeviceIdDto;

    const userDevices = [
        {
            device_id: 'sample-device-id',
            device_token: 'sample-device-token',
            device_type: 'sample-device-type',
            device_version: 'sample-device-version',
            app_version: 'sample-app-version',
            login_date: DateTime.fromISO('2023-06-15T00:00:00Z').toJSDate(),
        },
        {
            device_id: 'sample-device-id1',
            device_token: 'sample-device-token',
            device_type: 'sample-device-type',
            device_version: 'sample-device-version',
            app_version: 'sample-app-version',
            login_date: DateTime.fromISO('2023-05-10T00:00:00Z').toJSDate(),
        },
        {
            device_id: 'sample-device-id2',
            device_token: 'sample-device-token',
            device_type: 'sample-device-type',
            device_version: 'sample-device-version',
            app_version: 'sample-app-version',
            login_date: DateTime.fromISO('2023-06-05T00:00:00Z').toJSDate(),
        },
    ];

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        connection = moduleRef.get<Connection>(getConnectionToken());
        usersService = moduleRef.get<UsersService>(UsersService);
        configService = moduleRef.get<ConfigService>(ConfigService);
        // betaTestersService = moduleRef.get<BetaTestersService>(BetaTestersService);
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
        activeUser = await usersService.create(
            userFactory.build(
                { userDevices },
            ),
        );
        activeUserAuthToken = activeUser.generateNewJwtToken(
            configService.get<string>('JWT_SECRET_KEY'),
        );
    });

    describe('POST /api/v1/users/sign-out', () => {
        it('can successfully sign out', async () => {
            postBody = { device_id: 'sample-device-id1' };
            const response = await request(app.getHttpServer())
                .post('/api/v1/users/sign-out')
                .auth(activeUserAuthToken, { type: 'bearer' })
                .send(postBody)
                .expect(HttpStatus.CREATED);
            expect(response.body).toEqual({ success: true });
        });

        it('return the expected error when device id does not exist in userDevices', async () => {
            postBody = { device_id: 'browser1' };
            const response = await request(app.getHttpServer())
                .post('/api/v1/users/sign-out')
                .auth(activeUserAuthToken, { type: 'bearer' })
                .send(postBody)
                .expect(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual({ statusCode: 400, message: 'Device id is not found' });
        });
    });

    describe('DTO validations', () => {
        it('device_id should not be empty', async () => {
            postBody = { device_id: '' };
            const response = await request(app.getHttpServer())
                .post('/api/v1/users/sign-out')
                .auth(activeUserAuthToken, { type: 'bearer' })
                .send(postBody)
                .expect(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual({
                statusCode: 400,
                message: ['device_id should not be empty'],
                error: 'Bad Request',
            });
        });
    });
});
