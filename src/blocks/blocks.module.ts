/*eslint-disable import/no-cycle*/
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlocksController } from './blocks.controller';
import { FriendsGateway } from '../friends/providers/friends.gateway';
import { BlocksService } from './providers/blocks.service';
import { BlockAndUnblock, BlockAndUnblockSchema } from '../schemas/blockAndUnblock/blockAndUnblock.schema';
import { ChatModule } from '../chat/chat.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlockAndUnblock.name, schema: BlockAndUnblockSchema }]),
    ChatModule,
  ],
  controllers: [BlocksController],
  providers: [BlocksService, FriendsGateway],
  exports: [BlocksService, FriendsGateway],
})
export class BlocksModule { }
