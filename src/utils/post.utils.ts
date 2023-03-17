import { PostType } from '../schemas/feedPost/feedPost.enums';
import { FeedPost } from '../schemas/feedPost/feedPost.schema';

export function getPostType(post: FeedPost): PostType {
  if (post.postType) { return post.postType; }
  if (post.rssfeedProviderId) { return PostType.News; }

  return PostType.User;
}
