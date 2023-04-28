import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BetaTester, BetaTesterDocument } from '../../schemas/betaTester/betaTester.schema';

@Injectable()
export class BetaTesterService {
  constructor(
    @InjectModel(BetaTester.name) private betaTesterModel: Model<BetaTesterDocument>,
  ) {}

  async create(betaTester: Partial<BetaTesterDocument>) {
    return this.betaTesterModel.create(betaTester);
  }

  async findBetaTesterEmail(email: string): Promise<BetaTesterDocument> {
    return this.betaTesterModel
      .findOne({ email })
      .exec();
  }
}
