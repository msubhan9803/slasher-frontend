import {
  IsMongoId, IsNotEmpty,
 } from 'class-validator';

 export class FeedReplyIdDto {
   @IsNotEmpty()
   @IsMongoId()
   feedReplyId: string;
 }
