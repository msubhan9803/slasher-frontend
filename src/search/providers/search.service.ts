import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { escapeStringForRegex } from '../../utils/escape-utils';
import { User, UserDocument } from '../../schemas/user/user.schema';
import { ActiveStatus } from '../../schemas/user/user.enums';

export interface UserSearchResult {
  id: string;
  userName: string;
  firstName: string;
  profilePic: string;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async findUsers(query: string, limit: number, offset?: number, excludeUserIds?: User[]): Promise<UserSearchResult[]> {
    const user = await this.userModel
      .find({
        $and: [
          { userName: new RegExp(`^${escapeStringForRegex(query.toLowerCase())}`, 'i') },
          { _id: { $nin: excludeUserIds } },
          { deleted: false },
          { status: ActiveStatus.Active },
        ],
      })
      .select({
        userName: 1, profilePic: 1, _id: 1, firstName: 1,
      })
      .sort({ userName: 1 })
      .skip(offset)
      .limit(limit)
      .exec();
    return user as UserSearchResult[];
  }
}
