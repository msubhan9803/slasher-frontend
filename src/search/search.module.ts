import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchService } from './providers/search.service';
import { SearchController } from './search.controller';
import { User, UserSchema } from '../schemas/user/user.schema';
import { BlocksModule } from '../blocks/blocks.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    BlocksModule,
  ],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
