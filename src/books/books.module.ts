import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { BooksService } from './providers/books.service';
import { BooksController } from './books.controller';
import { Book, BookSchema } from '../schemas/book/book.schema';
import { BookUserStatus, BookUserStatusSchema } from '../schemas/bookUserStatus/bookUserStatus.schema';
import { User, UserSchema } from '../schemas/user/user.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Book.name,
        useFactory: () => {
          const schema = BookSchema;
          return schema;
        },
      },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: BookUserStatus.name, schema: BookUserStatusSchema }]),
    HttpModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
