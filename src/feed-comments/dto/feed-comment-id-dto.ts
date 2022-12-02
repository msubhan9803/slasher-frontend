import {
  IsMongoId, IsNotEmpty,
 } from 'class-validator';

 export class FeedCommentsIdDto {
   @IsNotEmpty()
   @IsMongoId()
   feedCommentId: string;
 }
