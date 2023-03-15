import {
  Controller, Get, ValidationPipe, Query,
} from '@nestjs/common';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { HashtagService } from './providers/hashtag.service';
import { FindHashtagDto } from '../search/dto/find-hashtag-dto';
import { pick } from '../utils/object-utils';

@Controller({ path: 'hashtags', version: ['1'] })
export class HashtagController {
  constructor(
    private readonly hashtagService: HashtagService,
  ) { }

  @Get('suggest')
  async suggestHashtagName(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindHashtagDto,
  ) {
    const hashtags = await this.hashtagService.suggestHashtagName(query.query, query.limit, true);
    return hashtags.map((hashtag) => pick(hashtag, ['_id', 'name']));
  }
}
