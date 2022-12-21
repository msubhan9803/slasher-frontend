import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportAndUnreport, ReportAndUnreportSchema } from '../schemas/reportAndUnreport/reportAndUnreport.schema';
import { ReportAndUnreportService } from './providers/reports.service';
import { ReportsController } from './reports.controller';
import { FeedComment, FeedCommentSchema } from '../schemas/feedComment/feedComment.schema';
import { FeedPostsModule } from '../feed-posts/feed-posts.module';
import { FeedReply, FeedReplySchema } from '../schemas/feedReply/feedReply.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ReportAndUnreport.name, schema: ReportAndUnreportSchema }]),
    MongooseModule.forFeature([{ name: FeedComment.name, schema: FeedCommentSchema }]),
    MongooseModule.forFeature([{ name: FeedReply.name, schema: FeedReplySchema }]),
    FeedPostsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportAndUnreportService],
  exports: [ReportAndUnreportService],
})
export class ReportsModule { }
