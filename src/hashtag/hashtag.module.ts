import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HashtagService } from './providers/hashtag.service';
import { Hashtag, HashtagSchema } from '../schemas/hastag/hashtag.schema';
import { HashtagController } from './hashtag.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hashtag.name, schema: HashtagSchema }]),
  ],
  providers: [HashtagService],
  exports: [HashtagService],
  controllers: [HashtagController],
})
export class HashtagModule { }
