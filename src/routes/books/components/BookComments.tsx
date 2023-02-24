import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCommentSection from '../../../components/ui/post/PostCommentSection/PostCommentSection';

const postData = [

  {
    id: 21,
    profileImage: 'https://i.pravatar.cc/300?img=13',
    userName: 'Aly Khan',
    profileDateTime: '06/19/2022 12:10 AM',
    like: 24,
    likeIcon: false,
    userMessage: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has this text here that will go to the end of the line.',
    commentReplySection:
      [
        {
          id: 22,
          image: 'https://i.pravatar.cc/300?img=45',
          name: 'Austin Joe',
          time: '06/19/2022 12:10 AM',
          like: 24,
          likeIcon: false,
          commentMention: '@Aly Khan',
          commentMsg: ' eque porro quisquam est qui dolorem ipsum',
        },
        {
          id: 23,
          image: 'https://i.pravatar.cc/300?img=25',
          name: 'Rohma Mxud',
          time: '06/19/2022 12:10 AM',
          like: 8,
          likeIcon: false,
          commentMention: '@Austin Joe',
          commentMsg: ' Lorem Ipsum has been the industry standard dummy',
          commentImg: 'https://i.pravatar.cc/100?img=56',
        },
      ],
  },
  {
    id: 24,
    profileImage: 'https://i.pravatar.cc/300?img=12',
    userName: 'Scott Watson',
    profileDateTime: '06/19/22 at 12:10 AM',
    likeIcon: false,
    userMessage: 'It is a long established fact that a reader will be distracted by.',
    commentReplySection: [],
  },

];
const viewPopoverOption = ['Report'];
const selfPopoverOption = ['Report', 'Delete'];

function BookComments() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  let popoverOptions = [];
  if (queryParam === 'self') {
    popoverOptions = selfPopoverOption;
  } else {
    popoverOptions = viewPopoverOption;
  }

  return (
    <div className="bg-dark bg-mobile-transparent p-4 pb-0 rounded-2 mt-3">
      <h1 className="h2 fw-bold py-2">Comments (28)</h1>
      <PostCommentSection commentSectionData={postData} commentImage="https://i.pravatar.cc/100?img=56" popoverOption={popoverOptions} />
    </div>
  );
}
export default BookComments;
