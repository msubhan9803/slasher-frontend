import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { userFactory } from '../../../test/factories/user.factory';
import { UsersService } from '../../users/providers/users.service';
import { UserDocument } from '../../schemas/user/user.schema';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { ReportAndUnreportService } from './report-and-unreports.service';
import { ReportReaction } from '../../schemas/reportAndUnreport/reportAndUnreport.enums';

describe('ReportAndUnreportService', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUser: UserDocument;
  let user0: UserDocument;
  let reportAndUnreportService: ReportAndUnreportService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    reportAndUnreportService = moduleRef.get<ReportAndUnreportService>(ReportAndUnreportService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    activeUser = await usersService.create(userFactory.build());
    user0 = await usersService.create(userFactory.build());
  });

  it('should be defined', () => {
    expect(ReportAndUnreportService).toBeDefined();
  });

  describe('#create', () => {
    it('creates the expected report', async () => {
      const reportAndUnreportObj = {
        from: activeUser.id,
        to: user0.id,
        reaction: ReportReaction.Reported,
        reasonOfReport: 'this is test reason',
      };
      const report = await reportAndUnreportService.create(reportAndUnreportObj);
      expect(report).toMatchObject(reportAndUnreportObj);
    });
  });
});
