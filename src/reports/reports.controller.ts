import {
  Body,
  Controller, HttpException, HttpStatus, Post, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { RssFeedProvider } from 'src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { ReportAndUnreportService } from './providers/report-and-unreports.service';
import { getUserFromRequest } from '../utils/request-utils';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportReaction } from '../schemas/reportAndUnreport/reportAndUnreport.enums';
import { FeedPostsService } from '../feed-posts/providers/feed-posts.service';
import { MailService } from '../providers/mail.service';
import { UsersService } from '../users/providers/users.service';
import { FeedCommentsService } from '../feed-comments/providers/feed-comments.service';
import { ChatService } from '../chat/providers/chat.service';
import { UserDocument } from '../schemas/user/user.schema';

@Controller({ path: 'reports', version: ['1'] })
export class ReportsController {
  constructor(
    private readonly reportAndUnreportService: ReportAndUnreportService,
    private readonly feedPostsService: FeedPostsService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
    private readonly feedCommentsService: FeedCommentsService,
    private readonly chatService: ChatService,
  ) { }

  @Post()
  async createReport(
    @Req() request: Request,
    @Body() createReportDto: CreateReportDto,
  ) {
    const user = getUserFromRequest(request);
    let userNameBeingReported: null | string = null;
    switch (createReportDto.reportType) {
      case 'profile': {
        const userData = await this.usersService.findById(createReportDto.targetId, true);
        if (!userData) {
          throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
        }
        const reportAndUnreportObj: any = {
          from: user._id,
          to: createReportDto.targetId,
          reaction: ReportReaction.Reported,
          reasonOfReport: createReportDto.reason,
        };
        await this.reportAndUnreportService.create(reportAndUnreportObj);
        userNameBeingReported = userData.userName;
        break;
      }
      case 'post': {
        const feedPost = await this.feedPostsService.findByIdWithPopulatedFields(createReportDto.targetId, false);
        if (!feedPost) {
          throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
        }
        feedPost.reportUsers.push({ userId: user._id, reason: createReportDto.reason });
        feedPost.save();
        userNameBeingReported = feedPost.rssfeedProviderId ? (feedPost.rssfeedProviderId as unknown as RssFeedProvider).title
          : (feedPost.userId as unknown as UserDocument).userName;
        break;
      }
      case 'comment': {
        const feedComment = await this.feedCommentsService.findFeedComment(createReportDto.targetId, true);
        if (!feedComment) {
          throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
        }
        feedComment.reportUsers.push({ userId: user._id, reason: createReportDto.reason });
        feedComment.save();
        userNameBeingReported = (feedComment.userId as unknown as UserDocument).userName;
        break;
      }
      case 'reply': {
        const feedReply = await this.feedCommentsService.findFeedReply(createReportDto.targetId, true);
        if (!feedReply) {
          throw new HttpException('Reply not found', HttpStatus.NOT_FOUND);
        }
        feedReply.reportUsers.push({ userId: user._id, reason: createReportDto.reason });
        feedReply.save();
        userNameBeingReported = (feedReply.userId as unknown as UserDocument).userName;
        break;
      }
      default:
        throw new HttpException('Invalid report type', HttpStatus.BAD_REQUEST);
    }
    await this.mailService.sendReportNotificationEmail(
      createReportDto.reportType,
      user.userName,
      userNameBeingReported,
      createReportDto.reason,
    );
    return { success: true };
  }
}
