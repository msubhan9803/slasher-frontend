import React from 'react';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomCreatePost from '../../components/ui/CustomCreatePost';
import postImage from '../../images/news-post.svg';
import PostFeed from '../../components/ui/PostFeed/PostFeed';
import SuggestedFriend from './SuggestedFriend';

const postData = [
  {
    id: 1,
    userName: 'Maureen Biologist',
    profileImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/18/2022 11:10 PM',
    content: 'Hell is empty and all the devils are here. \n',
    hashTag: ['horror', 'slasher', 'horroroasis'],
    postUrl: postImage,
    likeIcon: false,
  },
];
const popoverOptions = ['Edit', 'Delete'];

function Home() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <div>
        <CustomCreatePost />
        <h1 className="h2 mt-2 ms-3 ms-md-0">Suggested friends</h1>
        <SuggestedFriend />
        <PostFeed
          postFeedData={postData}
          popoverOptions={popoverOptions}
        />
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default Home;
