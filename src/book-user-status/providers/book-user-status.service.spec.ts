import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { AppModule } from '../../app.module';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { UsersService } from '../../users/providers/users.service';
import { userFactory } from '../../../test/factories/user.factory';
import { BookUserStatusService } from './book-user-status.service';
import { BookUserStatus, BookUserStatusDocument } from '../../schemas/bookUserStatus/bookUserStatus.schema';
import { BooksService } from '../../books/providers/books.service';
import { booksFactory } from '../../../test/factories/books.factory';
import {
 BookUserStatusBuy, BookUserStatusFavorites, BookUserStatusRead, BookUserStatusReadingList,
} from '../../schemas/bookUserStatus/bookUserStatus.enums';
import { BookActiveStatus } from '../../schemas/book/book.enums';

describe('BookUserStatusService', () => {
  let app: INestApplication;
  let connection: Connection;
  let bookUserStatusService: BookUserStatusService;
  let bookUserStatusModel: Model<BookUserStatusDocument>;
  let booksService: BooksService;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    bookUserStatusService = moduleRef.get<BookUserStatusService>(BookUserStatusService);
    booksService = moduleRef.get<BooksService>(BooksService);
    usersService = moduleRef.get<UsersService>(UsersService);
    bookUserStatusModel = moduleRef.get<Model<BookUserStatusDocument>>(getModelToken(BookUserStatus.name));
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let activeUser;
  let user0;
  let user1;
  let user2;
  let book;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    book = await booksService.create(
      booksFactory.build({
        status: BookActiveStatus.Active,
      }),
    );
    activeUser = await usersService.create(
      userFactory.build(),
    );
    user0 = await usersService.create(
      userFactory.build(),
    );
    user1 = await usersService.create(
      userFactory.build(),
    );
    user2 = await usersService.create(
      userFactory.build(),
    );
    await bookUserStatusModel.create({
      userId: activeUser._id,
      bookId: book._id,
    });
    await bookUserStatusModel.create({
      userId: user0._id,
      bookId: book._id,
    });
    await bookUserStatusModel.create({
      userId: user1._id,
      bookId: book._id,
    });
    await bookUserStatusModel.create({
      userId: user2._id,
      bookId: book._id,
    });
  });

  it('should be defined', () => {
    expect(bookUserStatusService).toBeDefined();
  });

  describe('#addBookUserStatusFavorite', () => {
    it('successfully creates a add book user status favorite', async () => {
      await bookUserStatusService.addBookUserStatusFavorite(activeUser._id.toString(), book._id.toString());
      const bookUserStatus = await bookUserStatusService.findBookUserStatus(activeUser._id.toString(), book._id.toString());
      expect(bookUserStatus.favourite).toBe(BookUserStatusFavorites.Favorite);
    });
  });

  describe('#deleteBookUserStatusFavorite', () => {
    it('successfully delete a add book user status favorite', async () => {
      await bookUserStatusService.deleteBookUserStatusFavorite(activeUser._id.toString(), book._id.toString());
      const bookUserStatus = await bookUserStatusService.findBookUserStatus(activeUser._id.toString(), book._id.toString());
      expect(bookUserStatus.favourite).toBe(BookUserStatusFavorites.NotFavorite);
    });
  });

  describe('#addBookUserStatusReadingList', () => {
    it('successfully creates a add book user status reading', async () => {
      await bookUserStatusService.addBookUserStatusReadingList(activeUser._id.toString(), book._id.toString());
      const bookUserStatus = await bookUserStatusService.findBookUserStatus(activeUser._id.toString(), book._id.toString());
      expect(bookUserStatus.readingList).toBe(BookUserStatusReadingList.ReadingList);
    });
  });

  describe('#deleteBookUserStatusReadingList', () => {
    it('successfully delete a add book user status reading', async () => {
      await bookUserStatusService.deleteBookUserStatusReadingList(activeUser._id.toString(), book._id.toString());
      const bookUserStatus = await bookUserStatusService.findBookUserStatus(activeUser._id.toString(), book._id.toString());
      expect(bookUserStatus.readingList).toBe(BookUserStatusReadingList.NotReadingList);
    });
  });

  describe('#addBookUserStatusRead', () => {
    it('successfully creates a add book user status read', async () => {
      await bookUserStatusService.addBookUserStatusRead(activeUser._id.toString(), book._id.toString());
      const bookUserStatus = await bookUserStatusService.findBookUserStatus(activeUser._id.toString(), book._id.toString());
      expect(bookUserStatus.read).toBe(BookUserStatusRead.Read);
    });
  });

  describe('#deleteBookUserStatusRead', () => {
    it('successfully delete a add book user status read', async () => {
      await bookUserStatusService.deleteBookUserStatusRead(activeUser._id.toString(), book._id.toString());
      const bookUserStatus = await bookUserStatusService.findBookUserStatus(activeUser._id.toString(), book._id.toString());
      expect(bookUserStatus.read).toBe(BookUserStatusRead.NotRead);
    });
  });

  describe('#addBookUserStatusBuy', () => {
    it('successfully creates a add book user status buy', async () => {
      await bookUserStatusService.addBookUserStatusBuy(activeUser._id.toString(), book._id.toString());
      const bookUserStatus = await bookUserStatusService.findBookUserStatus(activeUser._id.toString(), book._id.toString());
      expect(bookUserStatus.buy).toBe(BookUserStatusBuy.Buy);
    });
  });

  describe('#deleteBookUserStatusBuy', () => {
    it('successfully delete a add book user status buy', async () => {
      await bookUserStatusService.deleteBookUserStatusBuy(activeUser._id.toString(), book._id.toString());
      const bookUserStatus = await bookUserStatusService.findBookUserStatus(activeUser._id.toString(), book._id.toString());
      expect(bookUserStatus.buy).toBe(BookUserStatusBuy.NotBuy);
    });
  });

  describe('#findBookUserStatus', () => {
    it('successfully find a book user status', async () => {
      const bookUserStatusData = await bookUserStatusService.findBookUserStatus(activeUser._id.toString(), book._id.toString());
      expect(bookUserStatusData.userId.toString()).toBe(activeUser.id);
    });
  });

  describe('#findAllBookUserStatus', () => {
    it('successfully find a all movie user status', async () => {
      const user = [activeUser.id, user0.id, user1.id, user2.id];
      const bookUserStatusData = await bookUserStatusService.findAllBookUserStatus(user, book._id.toString());
      expect(bookUserStatusData[0].userId.toString()).toBe(activeUser.id);
      expect(bookUserStatusData[1].userId.toString()).toBe(user0.id);
      expect(bookUserStatusData[2].userId.toString()).toBe(user1.id);
      expect(bookUserStatusData[3].userId.toString()).toBe(user2.id);
    });
  });
});
