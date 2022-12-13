import {
    IsMongoId, IsNotEmpty,
   } from 'class-validator';

   export class FeedPostsIdDto {
     @IsNotEmpty()
     @IsMongoId()
     feedPostId: string;
   }
