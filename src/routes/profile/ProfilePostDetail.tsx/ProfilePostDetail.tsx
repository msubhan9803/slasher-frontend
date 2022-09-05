import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import postImage from '../../../images/news-post.svg';

const postData = [
  {
    id: 11,
    userName: 'Aly khan',
    profileImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/18/2022 11:10 PM',
    content: 'The Dream Master stars Lisa Wilcox and Tuesday Knight. Penned by Daniel and Casi Benedict, and produced by Red Serial Films, the film tells of a young',
    hashTag: ['horrorday', 'horrorcommunity', 'slasher', 'horror'],
    postUrl: postImage,
    likeIcon: true,
    comment: [
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
    ],
  },
];

function ProfilePostDetail() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  let popoverOptions = ['Report', 'Block user'];
  if (queryParam === 'self') {
    popoverOptions = ['Edit', 'Delete'];
  }

  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <PostFeed
        postFeedData={postData}
        popoverOptions={popoverOptions}
        isCommentSection
      />
    </AuthenticatedPageWrapper>
  );
}

export default ProfilePostDetail;
