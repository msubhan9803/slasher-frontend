import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BetaTestersService } from './providers/beta-testers.service';
import { BetaTester, BetaTesterSchema } from '../schemas/betaTester/betaTester.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: BetaTester.name, schema: BetaTesterSchema }]),
  ],
  controllers: [],
  providers: [BetaTestersService],
  exports: [BetaTestersService],
})
export class BetaTesterModule { }
