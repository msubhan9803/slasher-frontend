import {
  Controller,
} from '@nestjs/common';
import { FeedPostsService } from './providers/feed-post.service';

@Controller('feed-post')
export class FeedPostsController {
  constructor(private readonly feedPostsService: FeedPostsService) { }
}
