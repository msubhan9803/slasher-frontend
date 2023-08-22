import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HashtagFollowsService } from '../../hashtag-follows/providers/hashtag-follows.service';

@Injectable()
export class PostAccessService {
  constructor(
    private readonly hashtagFollowsService: HashtagFollowsService,
  ) { }

  async checkAccessPostService(user: object, hashtag: any): Promise<any> {
    const hashTagFollowPosts = await this.hashtagFollowsService.findAllByUserId((user as any)._id);
    const hashtagArr: any = [];
    for (let i = 0; i < hashTagFollowPosts.length; i += 1) {
      hashtagArr.push((hashTagFollowPosts[i].hashTagId as any).name);
    }
    const hashtagInArr = hashtag.filter((i) => hashtagArr.some((j) => i === j));
    if (hashtagInArr.length === 0 || hashTagFollowPosts.length === 0) {
      throw new HttpException('You can only interact with posts of friends.', HttpStatus.FORBIDDEN);
    }
  }
}
