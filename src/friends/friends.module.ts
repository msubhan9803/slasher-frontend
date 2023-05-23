import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendsController } from './friends.controller';
import { FriendsService } from './providers/friends.service';
import { Friend, FriendSchema } from '../schemas/friend/friend.schema';
import { User, UserSchema } from '../schemas/user/user.schema';
import { SuggestBlock, SuggestBlockSchema } from '../schemas/suggestBlock/suggestBlock.schema';
import { BlockAndUnblock, BlockAndUnblockSchema } from '../schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlocksService } from '../blocks/providers/blocks.service';
import { FriendsGateway } from './providers/friends.gateway';
import { ChatModule } from '../chat/chat.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Friend.name, schema: FriendSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: SuggestBlock.name, schema: SuggestBlockSchema }]),
    MongooseModule.forFeature([{ name: BlockAndUnblock.name, schema: BlockAndUnblockSchema }]),
    ChatModule,
  ],
  providers: [FriendsService, BlocksService, FriendsGateway],
  exports: [FriendsService, FriendsGateway],
  controllers: [FriendsController],
})
export class FriendsModule { }
