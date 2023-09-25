import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserFollow, UserFollowSchema } from '../schemas/userFollow/userFollow.schema';
import { UserFollowService } from './providers/userFollow.service';
import { UserFollowController } from './userFollow.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserFollow.name, schema: UserFollowSchema }]),
  ],
  controllers: [UserFollowController],
  providers: [UserFollowService],
  exports: [UserFollowService],
})
export class UserFollowModule { }
