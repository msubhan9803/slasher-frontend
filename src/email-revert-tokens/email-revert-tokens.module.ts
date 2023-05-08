import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailRevertToken, EmailRevertTokenSchema } from '../schemas/emailRevertToken/emailRevertToken.schema';
import { EmailRevertTokensService } from './providers/email-revert-tokens.service';

// Since the UsersModule is likely to be used in many places, we'll make it global
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: EmailRevertToken.name, schema: EmailRevertTokenSchema }]),
  ],
  controllers: [],
  providers: [EmailRevertTokensService],
  exports: [EmailRevertTokensService],
})
export class EmailRevertTokensModule { }
