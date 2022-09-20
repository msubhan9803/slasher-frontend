import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from '../notifications/notifications.module';
import { User, UserSchema } from '../schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './providers/users.service';
import { MailService } from '../providers/mail.service';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, MailService, LocalStorageService],
  exports: [UsersService],
})
export class UsersModule { }
