import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CreatePostInput from '../../../components/ui/post/CreatePostInput';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import ReportModal from '../../../components/ui/ReportModal';
import postImage from '../../../images/book-post-image.jpg';

const postData = [
  {
    id: 1,
    userName: 'Aly khan',
    profileImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/18/2022 11:10 PM',
    content: 'A retired cop battles a murderer who never gets his hands dirty when he kills. And a man stumbles into a league of immortal assassins, who kill to protect their.',
    postUrl: postImage,
    likeIcon: false,
  },
];
const selfOptions = ['Edit', 'Delete'];
const viewerOptions = ['Report'];
function BookPosts() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const popoverOptions = queryParam === 'self' ? selfOptions : viewerOptions;
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };
  return (
    <>
      {queryParam === 'self' && <CreatePostInput />}
      <PostFeed
        postFeedData={postData}
        popoverOptions={popoverOptions}
        isCommentSection={false}
        onPopoverClick={handlePopoverOption}
      />
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </>
  );
}

export default BookPosts;
