import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DisallowedUsernameService } from './providers/disallowed-username.service';
import { DisallowedUsername, DisallowedUsernameSchema } from '../schemas/disallowedUsername/disallowedUsername.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DisallowedUsername.name, schema: DisallowedUsernameSchema }]),
  ],
  controllers: [],
  providers: [DisallowedUsernameService],
  exports: [DisallowedUsernameService],
})
export class DisallowedUsernameModule { }
