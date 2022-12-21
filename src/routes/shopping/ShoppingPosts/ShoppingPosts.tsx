import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import ReportModal from '../../../components/ui/ReportModal';
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
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };

  return (
    <div className="mt-4">
      {queryParam === 'self' && <CustomCreatePost />}
      <PostFeed
        postFeedData={postData}
        popoverOptions={popoverOptions}
        isCommentSection={false}
        onPopoverClick={handlePopoverOption}
      />
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </div>
  );
}

export default ShoppingPosts;
