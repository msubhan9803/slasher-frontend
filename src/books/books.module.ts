import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { BooksService } from './providers/books.service';
import { BooksController } from './books.controller';
import { Book, BookSchema } from '../schemas/book/book.schema';

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
    HttpModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
