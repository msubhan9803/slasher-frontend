import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { BetaTesterDocument } from 'src/schemas/betaTester/betaTester.schema';
import { AppModule } from '../../app.module';
import { BetaTesterService } from './beta-tester.service';
import { betaTesterFactory } from '../../../test/factories/beta-tester.factory';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';

describe('BetaTesterService', () => {
  let app: INestApplication;
  let connection: Connection;
  let betaTestersService: BetaTesterService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    betaTestersService = moduleRef.get<BetaTesterService>(BetaTesterService);
    app = moduleRef.createNestApplication();
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
    expect(betaTestersService).toBeDefined();
  });

  describe('#create', () => {
    it('should create betaTester', async () => {
      const sampleBetaTester = betaTesterFactory.build();
      const betaTester = await betaTestersService.create(sampleBetaTester);
      expect(betaTester.email).toEqual(sampleBetaTester.email);
      expect(betaTester.name).toEqual(sampleBetaTester.name);
    });
  });

  describe('#findBetaTesterEmail', () => {
    let betaTester: BetaTesterDocument;
    const sampleBetaTester = betaTesterFactory.build();
    beforeEach(async () => {
      betaTester = await betaTestersService.create(
        betaTesterFactory.build(),
      );
    });

    it('finds the expected user using email', async () => {
      expect((await betaTestersService.findBetaTesterEmail(sampleBetaTester.email)).email).toEqual(
        betaTester.email,
      );
    });
  });
});
