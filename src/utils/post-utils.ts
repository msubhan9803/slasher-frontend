import { PostType } from '../schemas/feedPost/feedPost.enums';
import { FeedPost } from '../schemas/feedPost/feedPost.schema';

export function getPostType(post: FeedPost): PostType {
  if (post.rssfeedProviderId) { return PostType.News; } // remove once all post have a postType
  if (post.postType) { return post.postType; }

  return PostType.User;
}
