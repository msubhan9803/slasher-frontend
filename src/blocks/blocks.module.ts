import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlocksController } from './blocks.controller';
import { FriendsGateway } from '../friends/providers/friends.gateway';
import { BlocksService } from './providers/blocks.service';
import { BlockAndUnblock, BlockAndUnblockSchema } from '../schemas/blockAndUnblock/blockAndUnblock.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlockAndUnblock.name, schema: BlockAndUnblockSchema }]),
  ],
  controllers: [BlocksController],
  providers: [BlocksService, FriendsGateway],
  exports: [BlocksService, FriendsGateway],
})
export class BlocksModule { }
