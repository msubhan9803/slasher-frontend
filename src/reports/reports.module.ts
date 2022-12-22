import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportAndUnreport, ReportAndUnreportSchema } from '../schemas/reportAndUnreport/reportAndUnreport.schema';
import { ReportAndUnreportService } from './providers/reports.service';
import { ReportsController } from './reports.controller';
import { FeedPostsModule } from '../feed-posts/feed-posts.module';
import { MailService } from '../providers/mail.service';
import { FeedCommentsModule } from '../feed-comments/feed-comments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ReportAndUnreport.name, schema: ReportAndUnreportSchema }]),
    FeedPostsModule,
    FeedCommentsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportAndUnreportService, MailService],
  exports: [ReportAndUnreportService],
})
export class ReportsModule { }
