import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import ReportModal from '../../../components/ui/ReportModal';
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
        onPopoverClick={handlePopoverOption}
      />
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </div>
  );
}

export default PlacesPosts;
