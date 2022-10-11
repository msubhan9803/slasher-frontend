import {
  Controller
} from '@nestjs/common';
import { FriendsService } from './providers/friends.service'

@Controller('friends')
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsService,
  ) { }

}
