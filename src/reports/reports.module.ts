import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportAndUnreport, ReportAndUnreportSchema } from '../schemas/reportAndUnreport/reportAndUnreport.schema';
import { ReportAndUnreportService } from './providers/report-and-unreports.service';
import { ReportsController } from './reports.controller';
import { FeedPostsModule } from '../feed-posts/feed-posts.module';
import { FeedCommentsModule } from '../feed-comments/feed-comments.module';
import { MailModule } from '../providers/mail.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ReportAndUnreport.name, schema: ReportAndUnreportSchema }]),
    FeedPostsModule,
    FeedCommentsModule,
    MailModule,
    ChatModule,
  ],
  controllers: [ReportsController],
  providers: [ReportAndUnreportService],
  exports: [ReportAndUnreportService],
})
export class ReportsModule { }
