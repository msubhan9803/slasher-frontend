import {
    Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Put, Query, Req, ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateUserFollowDTO } from './dto/validate-user-follow.dto';
import { getUserFromRequest } from '../utils/request-utils';
import { UserFollowService } from './providers/userFollow.service';
import { pick } from '../utils/object-utils';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { FriendsService } from '../friends/providers/friends.service';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { FollowUserListDto } from './dto/get-all-follow-user-dto';

@Controller({ path: 'user-follow', version: ['1'] })
export class UserFollowController {
    constructor(
        private readonly userFollowService: UserFollowService,
        private readonly friendsService: FriendsService,
    ) { }

    @Put('follow-userId')
    async createUserFollow(@Req() request: Request, @Body() createUserFollowDTO: CreateUserFollowDTO) {
        const user = getUserFromRequest(request);

        if (user.id === createUserFollowDTO.followUserId) {
            throw new HttpException('You can not follow yourself', HttpStatus.BAD_REQUEST);
        }

        const areFriends = await this.friendsService.areFriends(user.id, createUserFollowDTO.followUserId);
        if (!areFriends) {
            throw new HttpException('You are not friends', HttpStatus.BAD_REQUEST);
        }
        const userFollow = await this.userFollowService.createOrUpdate(
            user.id,
            createUserFollowDTO.followUserId,
            createUserFollowDTO.notification,
        );
        return {
            ...pick(userFollow, [
                'userId',
                'followUserId',
                'pushNotifications',
                '_id',
            ]),
        };
    }

    @TransformImageUrls(
        '$[*].followUserId.profilePic',
    )
    @Get('fetch-all-follow-user')
    async findAll(
@Req() request: Request, @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FollowUserListDto,
) {
        const user = getUserFromRequest(request);
        const allFollowUser = await this.userFollowService.findAllFollowUser(user._id.toString(), query.limit, query.offset);
        const response = allFollowUser.map((userFollow) => ({
            ...pick(userFollow, [
                'userId',
                'followUserId',
                'pushNotifications',
            ]),
        }));
        return response;
    }

    @Delete(':followUserId')
    async deleteFollowUserData(@Req() request: Request, @Param('followUserId') followUserId: string) {
        const user = getUserFromRequest(request);
        const followUserData = await this.userFollowService.findFollowUserData(user._id.toString(), followUserId.toString());
        if (!followUserData) {
            throw new HttpException(
                'Follow user data not found',
                HttpStatus.NOT_FOUND,
            );
        }
        await this.userFollowService.delete(followUserData._id.toString());
        return { success: true };
    }

    @Get(':followUserId')
    async singleFollowUserData(@Req() request: Request, @Param('followUserId') followUserId: string) {
        const user = getUserFromRequest(request);
        const followUserData = await this.userFollowService.findFollowUserData(user._id.toString(), followUserId.toString());
        if (!followUserData) {
            throw new HttpException(
                'Follow user data not found',
                HttpStatus.NOT_FOUND,
            );
        }
        return { success: true };
    }
}
