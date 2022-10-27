import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendsController } from './friends.controller';
import { FriendsService } from './providers/friends.service';
import { Friend, FriendSchema } from '../schemas/friend/friend.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Friend.name, schema: FriendSchema }]),
  ],
  providers: [FriendsService],
  exports: [FriendsService],
  controllers: [FriendsController],
})
export class FriendsModule { }
