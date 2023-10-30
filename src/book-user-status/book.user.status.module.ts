import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookUserStatusService } from './providers/book-user-status.service';
import { BookUserStatus, BookUserStatusSchema } from '../schemas/bookUserStatus/bookUserStatus.schema';

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([{ name: BookUserStatus.name, schema: BookUserStatusSchema }]),
    ],
    providers: [BookUserStatusService],
    exports: [BookUserStatusService],
    controllers: [],
})
export class BookUserStatusModule { }
