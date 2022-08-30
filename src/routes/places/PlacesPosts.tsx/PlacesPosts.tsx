import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import postImage from '../../../images/place-post.jpg';

const postData = [
  {
    id: 1,
    userName: 'High Desert Haunted House',
    profileImage: postImage,
    postDate: '06/18/2022 11:10 PM',
    content: 'The first, Deadwood Ghost Town, perfectly recreates the authentic dirty feel of an abandoned ranch in a 12-minute, open-air haunted attraction.',
    postUrl: postImage,
    likeIcon: false,
  },
  {
    id: 2,
    userName: 'High Desert Haunted House',
    profileImage: postImage,
    postDate: '06/18/2022 11:10 PM',
    content: 'The first, Deadwood Ghost Town, perfectly recreates the authentic dirty feel of an abandoned ranch in a 12-minute, open-air haunted attraction.',
    postUrl: '',
    likeIcon: false,
  },
];

function PlacesPosts() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  let popoverOptions;
  if (queryParam === 'self') {
    popoverOptions = ['Edit post', 'Delete post'];
  } else {
    popoverOptions = ['Report post'];
  }

  return (
    <div className="mt-4">
      {queryParam === 'self' && <CustomCreatePost imageUrl={postImage} />}
      <PostFeed postFeedData={postData} popoverOptions={popoverOptions} />
    </div>
  );
}

export default PlacesPosts;
