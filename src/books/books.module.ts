import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { BooksService } from './providers/books.service';
import { BooksController } from './books.controller';
import { Book, BookSchema } from '../schemas/book/book.schema';
import { BookUserStatus, BookUserStatusSchema } from '../schemas/bookUserStatus/bookUserStatus.schema';
import { User, UserSchema } from '../schemas/user/user.schema';
import { BookUserStatusModule } from '../book-user-status/book.user.status.module';
import { addPrePostHooks } from '../schemas/book/book.pre-post-hooks';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { RecentBookBlock, RecentBookBlockSchema } from '../schemas/recentBookBlock/recentBookBlock.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Book.name,
        useFactory: () => {
          const schema = BookSchema;
          addPrePostHooks(schema);
          return schema;
        },
      },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: BookUserStatus.name, schema: BookUserStatusSchema }]),
    MongooseModule.forFeature([{ name: RecentBookBlock.name, schema: RecentBookBlockSchema }]),
    HttpModule,
    BookUserStatusModule,
  ],
  controllers: [BooksController],
  providers: [BooksService, S3StorageService, LocalStorageService],
  exports: [BooksService],
})
export class BooksModule {}
