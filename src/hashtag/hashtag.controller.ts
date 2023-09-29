import {
  Controller, Get, ValidationPipe, Query, Patch, Body, Param, HttpException, HttpStatus, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { HashtagService } from './providers/hashtag.service';
import { FindHashtagDto } from '../search/dto/find-hashtag-dto';
import { pick } from '../utils/object-utils';
import { UpdateHashtagStatusDto } from '../search/dto/update-hashtag-status-dto';
import { UpdateHashtagStatusParamDto } from '../search/dto/update-hashtag-status-param-dto';
import { getUserFromRequest } from '../utils/request-utils';
import { UserType } from '../schemas/user/user.enums';
import { FindAllHashtagsDto } from '../search/dto/find-all-hashtags-dto';

@Controller({ path: 'hashtags', version: ['1'] })
export class HashtagController {
  constructor(
    private readonly hashtagService: HashtagService,
  ) { }

  adminOnlyApiRestrictionMessage = 'Only admins can access this API';

  @Get('suggest')
  async suggestHashtagName(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindHashtagDto,
  ) {
    const hashtags = await this.hashtagService.suggestHashtagName(query.query, query.limit, true);
    return hashtags.map((hashtag) => pick(hashtag, ['_id', 'name']));
  }

  @Get('onboarding-suggestions')
  async hashtagOnboardingSuggestions() {
    const hashtags = await this.hashtagService.hashtagOnboardingSuggestions();
    return hashtags;
  }

  // Admin only route
  @Get('admin/find-all')
  async findAll(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: FindAllHashtagsDto,
  ) {
    const user = getUserFromRequest(request);
    const isAdmin = user.userType === UserType.Admin;
    if (!isAdmin) {
      throw new HttpException(this.adminOnlyApiRestrictionMessage, HttpStatus.NOT_FOUND);
    }
    const { allItemsCount, items } = await this.hashtagService.findAll(
      query.page,
      query.perPage,
      query.sortBy,
      query.nameContains,
    );

    return {
      page: query.page,
      perPage: query.perPage,
      allItemsCount,
      items: items.map(
        (hashtag) => pick(hashtag, ['_id', 'name', 'createdAt', 'status']),
      ),
    };
  }

  // Admin only route
  @Patch('admin/update-status/:id')
  async updateHashtagStatus(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: UpdateHashtagStatusParamDto,
    @Body() updateHashtagStatusDto: UpdateHashtagStatusDto,
  ) {
    const user = getUserFromRequest(request);
    const isAdmin = user.userType === UserType.Admin;
    if (!isAdmin) {
      throw new HttpException(this.adminOnlyApiRestrictionMessage, HttpStatus.NOT_FOUND);
    }

    const exists = await this.hashtagService.hashtagExists(param.id);
    if (!exists) {
      throw new HttpException(`Hashtag with id: ${param.id} not found!`, HttpStatus.NOT_FOUND);
    }

    const { status } = updateHashtagStatusDto;
    const hashtag = await this.hashtagService.updateHashtagStatus(param.id, status);
    return pick(hashtag, ['_id', 'name', 'createdAt', 'status']);
  }
}
