import React, { useState } from 'react';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomCreatePost from '../../components/ui/CustomCreatePost';
import postImage from '../../images/post-image.jpg';
import PostFeed from '../../components/ui/PostFeed/PostFeed';
import SuggestedFriend from './SuggestedFriend';
import ReportModal from '../../components/ui/ReportModal';

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
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const handlePopoverOption = (value: string) => {
    if (value === 'Delete') {
      setShow(true);
      setDropDownValue(value);
    }
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <div>
        <CustomCreatePost imageUrl="https://i.pravatar.cc/300?img=12" />
        <h1 className="h2 mt-2 ms-3 ms-md-0">Suggested friends</h1>
        <SuggestedFriend />
        <PostFeed
          postFeedData={postData}
          popoverOptions={popoverOptions}
          isCommentSection={false}
          onPopoverClick={handlePopoverOption}
        />
      </div>
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}

export default Home;
