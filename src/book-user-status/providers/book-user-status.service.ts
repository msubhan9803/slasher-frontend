import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { BookUserStatus, BookUserStatusDocument } from '../../schemas/bookUserStatus/bookUserStatus.schema';
import {
 BookUserStatusBuy, BookUserStatusFavorites, BookUserStatusRead, BookUserStatusReadingList,
} from '../../schemas/bookUserStatus/bookUserStatus.enums';

@Injectable()
export class BookUserStatusService {
  constructor(@InjectModel(BookUserStatus.name) private bookUserStatusModel: Model<BookUserStatusDocument>) { }

  async findBookUserStatus(userId: string, bookId: string): Promise<BookUserStatus> {
    const bookUserStatus = await this.bookUserStatusModel
      .findOne({
        $and: [{ userId: new mongoose.Types.ObjectId(userId) }, { bookId: new mongoose.Types.ObjectId(bookId) }],
      })
      .exec();
    return bookUserStatus;
  }

  async addBookUserStatusFavorite(userId: string, bookId: string): Promise<void> {
    await this.bookUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        bookId: new mongoose.Types.ObjectId(bookId),
      },
      { $set: { favourite: BookUserStatusFavorites.Favorite } },
      { upsert: true },
    );
  }

  async deleteBookUserStatusFavorite(userId: string, bookId: string): Promise<void> {
    await this.bookUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        bookId: new mongoose.Types.ObjectId(bookId),
      },
      { $set: { favourite: BookUserStatusFavorites.NotFavorite } },
    );
  }

  async addBookUserStatusRead(userId: string, bookId: string): Promise<void> {
    await this.bookUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        bookId: new mongoose.Types.ObjectId(bookId),
      },
      { $set: { read: BookUserStatusRead.Read } },
      { upsert: true },
    );
  }

  async deleteBookUserStatusRead(userId: string, bookId: string): Promise<void> {
    await this.bookUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        bookId: new mongoose.Types.ObjectId(bookId),
      },
      { $set: { read: BookUserStatusRead.NotRead } },
    );
  }

  async addBookUserStatusReadingList(userId: string, bookId: string): Promise<void> {
    await this.bookUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        bookId: new mongoose.Types.ObjectId(bookId),
      },
      { $set: { readingList: BookUserStatusReadingList.ReadingList } },
      { upsert: true },
    );
  }

  async deleteBookUserStatusReadingList(userId: string, bookId: string): Promise<void> {
    await this.bookUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        bookId: new mongoose.Types.ObjectId(bookId),
      },
      { $set: { readingList: BookUserStatusReadingList.NotReadingList } },
    );
  }

  async addBookUserStatusBuy(userId: string, bookId: string): Promise<void> {
    await this.bookUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        bookId: new mongoose.Types.ObjectId(bookId),
      },
      { $set: { buy: BookUserStatusBuy.Buy } },
      { upsert: true },
    );
  }

  async deleteBookUserStatusBuy(userId: string, bookId: string): Promise<void> {
    await this.bookUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        bookId: new mongoose.Types.ObjectId(bookId),
      },
      { $set: { buy: BookUserStatusBuy.NotBuy } },
    );
  }
}
