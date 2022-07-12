export interface SearchProps {
  hashtags: HashTags[];
}

interface HashTags {
  name: string;
}
export interface PostsProps {
  post: PostProps;
}

interface PostProps {
  id: number;
  userImage: string;
  userName: string;
  postDate: string;
  content: string;
  hashTag: string[];
}
