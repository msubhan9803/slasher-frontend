import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BetaTesterService } from './providers/beta-tester.service';
import { BetaTester, BetaTesterSchema } from '../schemas/betaTester/betaTester.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: BetaTester.name, schema: BetaTesterSchema }]),
  ],
  controllers: [],
  providers: [BetaTesterService],
  exports: [BetaTesterService],
})
export class BetaTesterModule { }
