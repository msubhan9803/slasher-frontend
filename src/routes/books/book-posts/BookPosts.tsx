import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import ReportModal from '../../../components/ui/ReportModal';
import postImage from '../../../images/book-post-image.jpg';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';

const postData = [
  {
    id: 1,
    userName: 'Aly khan',
    profileImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '2023-07-13T09:01:52.844Z',
    message: 'A retired cop battles a murderer who never gets his hands dirty when he kills. And a man stumbles into a league of immortal assassins, who kill to protect their.',
    images: [{ description: '1', image_path: postImage, _id: '6677' }],
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
      {/* {queryParam === 'self' &&  */}
      <CustomCreatePost className="mt-3 mt-lg-0" />
      {/* } */}
      <div className="mt-3">
        <PostFeed
          postFeedData={postData}
          popoverOptions={popoverOptions}
          isCommentSection={false}
          onPopoverClick={handlePopoverOption}
        />
      </div>
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </>
  );
}

export default BookPosts;
