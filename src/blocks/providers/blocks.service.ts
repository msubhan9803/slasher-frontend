import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from '../../schemas/user/user.schema';
import { BlockAndUnblockReaction } from '../../schemas/blockAndUnblock/blockAndUnblock.enums';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../schemas/blockAndUnblock/blockAndUnblock.schema';

@Injectable()
export class BlocksService {
  constructor(@InjectModel(BlockAndUnblock.name) private blocksModel: Model<BlockAndUnblockDocument>) { }

  async createBlock(fromUserId: string, toUserId: string): Promise<void> {
    await this.blocksModel.updateOne(
      {
        from: new mongoose.Types.ObjectId(fromUserId),
        to: new mongoose.Types.ObjectId(toUserId),
      },
      { $set: { reaction: BlockAndUnblockReaction.Block } },
      { upsert: true },
    );
  }

  async deleteBlock(fromUserId: string, toUserId: string): Promise<void> {
    await this.blocksModel.deleteOne(
      {
        from: new mongoose.Types.ObjectId(fromUserId),
        to: new mongoose.Types.ObjectId(toUserId),
      },
    );
  }

  async getUserIdsForBlocksToOrFromUser(userId: string, postUserId?: string): Promise<string[]> {
    const blocks = await this.blocksModel.find({
      $and: [
        {
          $or: [{ to: new mongoose.Types.ObjectId(userId) }, { from: new mongoose.Types.ObjectId(userId) }],
        },
        {
          reaction: BlockAndUnblockReaction.Block,
        },
      ],
    });

    const postUserBlocks = await this.blocksModel.find({
      $and: [
        {
          $or: [{ to: new mongoose.Types.ObjectId(postUserId) },
            { from: new mongoose.Types.ObjectId(postUserId) }],
        },
        {
          reaction: BlockAndUnblockReaction.Block,
        },
      ],
    });

    const blockFromOrToUserIds = blocks.map((block) => (block.from.toString() === userId ? block.to.toString() : block.from.toString()));

    const blockFromOrToPostUserIds = postUserBlocks.map((block) => (block.from.toString() === postUserId
    ? block.to.toString() : block.from.toString()));

    const constcatedUserIds = blockFromOrToUserIds.concat(blockFromOrToPostUserIds);

    const setBlockFromOrToUserIds = new Set(constcatedUserIds);

    return [...setBlockFromOrToUserIds];
  }

  async getBlockedUsersBySender(fromUserId: string, limit: number, offset?: number): Promise<User[]> {
    const blocks = await this.blocksModel.find({
      $and: [{
        from: new mongoose.Types.ObjectId(fromUserId),
      },
      {
        reaction: BlockAndUnblockReaction.Block,
      }],
    })
      .populate('to', 'userName _id profilePic firstName')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
    const toData = blocks.map((block) => block.to);
    return toData;
  }

  /**
   * Deletes all blocks from or to the given user.
   * @param userId
   */
  async deleteAllByUserId(userId: string): Promise<void> {
    await this.blocksModel.deleteMany(
      {
        $or: [
          { from: new mongoose.Types.ObjectId(userId) },
          { to: new mongoose.Types.ObjectId(userId) },
        ],
      },
    );
  }

  async blockExistsBetweenUsers(userId1: string, userId2: string): Promise<boolean> {
    const blockAndUnblock: any = await this.blocksModel
      .findOne({
        $or: [
          { from: new mongoose.Types.ObjectId(userId1), to: new mongoose.Types.ObjectId(userId2) },
          { from: new mongoose.Types.ObjectId(userId2), to: new mongoose.Types.ObjectId(userId1) },
        ],
      })
      .exec();
    return !!blockAndUnblock;
  }
}
