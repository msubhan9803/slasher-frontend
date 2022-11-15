import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import {  } from './blocks.controller';
import { BlocksService } from './providers/blocks.service';
import { BlockAndUnblock, BlockAndUnblockSchema } from '../schemas/blockAndUnblock/blockAndUnblock.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlockAndUnblock.name, schema: BlockAndUnblockSchema }]),
  ],
  controllers: [],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlocksModule { }
