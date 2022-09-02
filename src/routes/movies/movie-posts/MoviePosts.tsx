import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import CreatePostInput from './CreatePostInput';
import postImage from '../../../images/movie-post.jpg';

const selfPostData = [
  {
    id: 1,
    userName: 'The Curse of La Patasola',
    profileImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/18/2022 11:10 PM',
    content: 'Samuel Goldwyn Films presents Dreamcatcher, a new horror movie written and directed by Jacob Johnston and coming to On-Demand and Digital on March 5, 2021.',
    postUrl: postImage,
    likeIcon: false,
  },
  {
    id: 2,
    userName: 'The Curse of La Patasola',
    profileImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/11/2022 11:10 PM',
    content: 'Hell is empty and all the devils are here. \n',
    hashTag: ['horrorday', 'horrorcommunity', 'slasher', 'horror'],
    likeIcon: true,
  },
];
const viewerPostData = [
  {
    id: 1,
    userName: 'The Curse of La Patasola',
    profileImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/18/2022 11:10 PM',
    content: 'Samuel Goldwyn Films presents Dreamcatcher, a new horror movie written and directed by Jacob Johnston and coming to On-Demand and Digital on March 5, 2021.',
    postUrl: postImage,
    likeIcon: false,
  },
];

const selfOptions = ['Edit', 'Delete'];
const viewerOptions = ['Report'];
function MoviePosts() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const popoverOptions = queryParam === 'self' ? selfOptions : viewerOptions;
  const postData = queryParam === 'self' ? selfPostData : viewerPostData;
  return (
    <>
      {queryParam === 'self' && <CreatePostInput />}
      <PostFeed
        postFeedData={postData}
        popoverOptions={popoverOptions}
        isCommentSection={false}
      />
    </>
  );
}

export default MoviePosts;
