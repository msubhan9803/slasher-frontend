import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import postImage from '../../../images/news-post.svg';
import ProfileHeader from '../ProfileHeader';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import ReportModal from '../../../components/ui/ReportModal';

const postData = [
  {
    id: 1,
    userName: 'Aly khan',
    profileImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/18/2022 11:10 PM',
    content: 'Hell is empty and all the devils are here. \n',
    hashTag: ['horror', 'slasher', 'horroroasis'],
    postUrl: postImage,
    likeIcon: false,
  },
  {
    id: 2,
    userName: 'Aly khan',
    profileImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/11/2022 11:10 PM',
    content: 'Hell is empty and all the devils are here.',
    hashTag: ['horror', 'slasher', 'horroroasis'],
    likeIcon: true,
  },
];
const popoverOptions = ['Edit', 'Delete'];
function ProfilePosts() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="posts" />
      {queryParam === 'self'
        && (
          <div className="mt-4">
            <CustomCreatePost imageUrl="https://i.pravatar.cc/300?img=12" />
          </div>
        )}
      <PostFeed
        postFeedData={postData}
        popoverOptions={popoverOptions}
        isCommentSection={false}
        onPopoverClick={handlePopoverOption}
      />
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}
export default ProfilePosts;
