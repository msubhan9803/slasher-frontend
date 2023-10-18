import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { BooksService } from '../../../../../src/books/providers/books.service';
import { BookUserStatusService } from '../../../../../src/book-user-status/providers/book-user-status.service';
import { BookUserStatus, BookUserStatusDocument } from '../../../../../src/schemas/bookUserStatus/bookUserStatus.schema';
import { booksFactory } from '../../../../factories/books.factory';
import { BookUserStatusRead } from '../../../../../src/schemas/bookUserStatus/bookUserStatus.enums';

describe('Delete Book User Status Read (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let usersService: UsersService;
    let activeUserAuthToken: string;
    let activeUser: User;
    let configService: ConfigService;
    let booksService: BooksService;
    let bookUserStatusService: BookUserStatusService;
    let bookUserStatusModel: Model<BookUserStatusDocument>;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        connection = moduleRef.get<Connection>(getConnectionToken());
        usersService = moduleRef.get<UsersService>(UsersService);
        configService = moduleRef.get<ConfigService>(ConfigService);
        booksService = moduleRef.get<BooksService>(BooksService);
        bookUserStatusService = moduleRef.get<BookUserStatusService>(BookUserStatusService);
        bookUserStatusModel = moduleRef.get<Model<BookUserStatusDocument>>(getModelToken(BookUserStatus.name));

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        // Drop database so we start fresh before each test
        await clearDatabase(connection);

        // Reset sequences so we start fresh before each test
        rewindAllFactories();
    });

    describe('DELETE /books/:bookId/lists/reading', () => {
        let book;
        beforeEach(async () => {
            activeUser = await usersService.create(userFactory.build());
            activeUserAuthToken = activeUser.generateNewJwtToken(
                configService.get<string>('JWT_SECRET_KEY'),
            );
            book = await booksService.create(
                booksFactory.build(),
            );
            await bookUserStatusModel.create({
                name: 'book user status1',
                userId: activeUser._id,
                bookId: book._id,
                favourite: 0,
                read: 0,
                readingList: 0,
                buy: 0,
            });
        });

        it('successfully deletes a add book user status read', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/books/${book.id}/lists/read`)
                .auth(activeUserAuthToken, { type: 'bearer' })
                .send();
            expect(response.body).toEqual({ success: true });
            const bookUserStatus = await bookUserStatusService.findBookUserStatus(activeUser._id.toString(), book._id.toString());
            expect(bookUserStatus.read).toBe(BookUserStatusRead.NotRead);
        });

        it('returns the expected response when the bookId is not found', async () => {
            const bookId = '6337f478980180f44e64487c';
            const response = await request(app.getHttpServer())
                .delete(`/books/${bookId}/lists/read`)
                .auth(activeUserAuthToken, { type: 'bearer' })
                .send();
            expect(response.body).toEqual({
                message: 'Book not found',
                statusCode: 404,
            });
        });

        describe('Validation', () => {
            it('bookId must be a mongodb id', async () => {
                const bookId = '634912b22c2f4*5e0e62285';
                const response = await request(app.getHttpServer())
                    .delete(`/books/${bookId}/lists/read`)
                    .auth(activeUserAuthToken, { type: 'bearer' })
                    .send();
                expect(response.body).toEqual({
                    error: 'Bad Request',
                    message: [
                        'bookId must be a mongodb id',
                    ],
                    statusCode: 400,
                });
            });
        });
    });
});
