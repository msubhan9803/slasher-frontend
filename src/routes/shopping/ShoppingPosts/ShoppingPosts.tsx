import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import postImage from '../../../images/shopping-post.png';
import profileImage from '../../../images/shopping-profile.png';

const postData = [
  {
    id: 1,
    userName: 'Cavity Colors',
    profileImage,
    postDate: '06/18/2022 11:10 PM',
    content: '🔪 Sorry Jack. Chucky’s back! 🩸 We’re so incredibly excited to announce part 1 of our officially licensed CHUCKY Franchise Series kicks off next Tuesday, June 28th at 5 PM EST! Hold on tight, this one’s gonna be KILLER!',
    postUrl: postImage,
    likeIcon: false,
    hashTag: ['chucky'],
  },
];

function ShoppingPosts() {
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
      {queryParam === 'self' && <CustomCreatePost imageUrl={profileImage} />}
      <PostFeed postFeedData={postData} popoverOptions={popoverOptions} />
    </div>
  );
}

export default ShoppingPosts;
