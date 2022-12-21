import {
  Body,
  Controller, HttpException, HttpStatus, Post, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReportAndUnreportService } from './providers/reports.service';
import { getUserFromRequest } from '../utils/request-utils';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportReaction } from '../schemas/reportAndUnreport/reportAndUnreport.enums';
import { FeedPostsService } from '../feed-posts/providers/feed-posts.service';
import { FeedComment, FeedCommentDocument } from '../schemas/feedComment/feedComment.schema';
import { FeedReply, FeedReplyDocument } from '../schemas/feedReply/feedReply.schema';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportAndUnreportService: ReportAndUnreportService,
    private readonly feedPostsService: FeedPostsService,
    @InjectModel(FeedComment.name) private feedCommentModel: Model<FeedCommentDocument>,
    @InjectModel(FeedReply.name) private feedReplyModel: Model<FeedReplyDocument>,
  ) { }

  @Post()
  async createReport(
    @Req() request: Request,
    @Body() createReportDto: CreateReportDto,
  ) {
    const user = getUserFromRequest(request);
    switch (createReportDto.reportType) {
      case 'profile':
        const reportAndUnreportObj: any = {
          from: user._id,
          to: createReportDto.targetId,
          reaction: ReportReaction.Reported,
          reasonOfReport: createReportDto.reason,
        };
        await this.reportAndUnreportService.create(reportAndUnreportObj);
        break;
      case 'post':
        const feedPost = await this.feedPostsService.findById(createReportDto.targetId, false);
        if (!feedPost) {
          throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
        }
        feedPost.reportUsers.push({ userId: user._id, reason: createReportDto.reason });
        feedPost.save();
        break;
      case 'comment':
        const feedComment = await this.feedCommentModel.findOne({ feedPostId: createReportDto.targetId });
        if (!feedComment) {
          throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
        }
        feedComment.reportUsers.push({ userId: user._id, reason: createReportDto.reason });
        feedComment.save();
        break;
      case 'reply':
        const feedReply = await this.feedReplyModel.findOne({ feedPostId: createReportDto.targetId });
        if (!feedReply) {
          throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
        }
        feedReply.reportUsers.push({ userId: user._id, reason: createReportDto.reason });
        feedReply.save();
        break;
      default:
        throw new HttpException('Invalid report type', HttpStatus.BAD_REQUEST);
    }
    return { success: true };
  }
}
