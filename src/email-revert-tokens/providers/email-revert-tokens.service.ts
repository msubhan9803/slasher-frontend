import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmailRevertToken, EmailRevertTokenDocument } from '../../schemas/emailRevertToken/emailRevertToken.schema';

@Injectable()
export class EmailRevertTokensService {
  constructor(@InjectModel(EmailRevertToken.name) private emailRevertTokenModel: Model<EmailRevertToken>) { }

  async create(userId: string, tokenValue: string, emailToRevertTo: string) {
    return this.emailRevertTokenModel.create({ userId: new Types.ObjectId(userId), value: tokenValue, emailToRevertTo });
  }

  /**
   * Returns a valid token that meets the requirements defined by this method's parameters.
   * @param userId User id associated with the token.
   * @param tokenValue Token value.
   * @param createdAfter Token must have been created after this date (used to ensure that tokens
   *                     are no longer findable/usable after a certain amount of time has passed).
   * @returns
   */
  async findToken(userId: string, tokenValue: string, createdAfter: Date): Promise<EmailRevertTokenDocument> {
    return this.emailRevertTokenModel.findOne({
      userId: new Types.ObjectId(userId),
      value: tokenValue,
      createdAt: { $gt: createdAfter },
    }).exec();
  }

  /**
   * Finds the token with the given userId and token value, deletes it, and also deletes
   * all other tokens for the userId that were created after the deleted token.
   * @param userId
   * @param tokenValue
   * @returns
   */
  async deleteTokenAndLaterIssuedTokens(userId: string, tokenValue: string): Promise<void> {
    // Find the token
    const emailRevertToken = await this.emailRevertTokenModel.findOne({
      userId: new Types.ObjectId(userId),
      value: tokenValue,
    }).exec();
    // Delete the found token and any later-issued tokens
    await this.emailRevertTokenModel.deleteMany({
      userId: new Types.ObjectId(userId),
      createdAt: { $gte: emailRevertToken.createdAt },
    }).exec();
  }
}
