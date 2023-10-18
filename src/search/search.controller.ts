import {
  Controller, Req, Get, ValidationPipe, Query,
} from '@nestjs/common';
import { Request } from 'express';
import { getUserFromRequest } from '../utils/request-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { SearchService } from './providers/search.service';
import { BlocksService } from '../blocks/providers/blocks.service';
import { FindUsersDto } from './dto/find-users-dto';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { HashtagService } from '../hashtag/providers/hashtag.service';
import { FindHashtagDto } from './dto/find-hashtag-dto';

@Controller({ path: 'search', version: ['1'] })
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly hashtagService: HashtagService,
    private readonly blocksService: BlocksService,
  ) { }

  @TransformImageUrls('$[*].profilePic')
  @Get('users')
  async findUsers(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: FindUsersDto,
  ) {
    const resultLimit = 100;
    let adjustedLimit = query.limit;
    if (query.offset + query.limit > resultLimit) {
      adjustedLimit = resultLimit - query.offset;
    }
    // If adjustedLimit is less than 1, then we always want to skip any query and return an empty array (no more results).
    if (adjustedLimit < 1) {
      return [];
    }
    const user = getUserFromRequest(request);
    const excludedUserIds = await this.blocksService.getUserIdsForBlocksToOrFromUser(user.id);
    const findUsersData = await this.searchService.findUsers(query.query, adjustedLimit, query.offset, excludedUserIds);
    return findUsersData;
  }

  @Get('hashtags')
  async findHashtagNames(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindHashtagDto,
  ) {
    return this.hashtagService.suggestHashtagName(query.query, query.limit, true, query.offset);
  }
}
