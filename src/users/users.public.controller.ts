/* eslint-disable max-lines */
import {
  Controller, HttpException, HttpStatus, Get, Param,
} from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { UserDocument } from '../schemas/user/user.schema';
import { SIMPLE_MONGODB_ID_REGEX } from '../constants';
import { pick } from '../utils/object-utils';
import { ProfileVisibility } from '../schemas/user/user.enums';
import { Public } from '../app/guards/auth.guard';

@Controller({ path: 'users/public', version: ['1'] })
export class UsersPublicController {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  @TransformImageUrls('$.profilePic', '$.coverPhoto')
  @Get(':userNameOrId')
  @Public()
  async findOne(@Param('userNameOrId') userNameOrId: string) {
    let user: UserDocument;
    if (SIMPLE_MONGODB_ID_REGEX.test(userNameOrId)) {
      user = await this.usersService.findById(userNameOrId, true);
    } else {
      user = await this.usersService.findByUsername(userNameOrId, true);
    }
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (user.profile_status === ProfileVisibility.Private) {
      user.aboutMe = null;
    }
    const pickFields = ['_id', 'firstName', 'userName', 'profilePic', 'coverPhoto', 'aboutMe', 'profile_status'];

    return { ...pick(user, pickFields) };
  }
}
