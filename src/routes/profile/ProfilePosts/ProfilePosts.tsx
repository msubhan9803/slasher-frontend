import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Image } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import postImage from '../../../images/news-post.svg';
import ProfileHeader from '../ProfileHeader';
import RoundButton from '../../../components/ui/RoundButton';

const CommentProfileImage = styled(Image)`
  height:2.5rem;
  width:2.5rem;
`;
const StyledDiv = styled.div`
  border : 1px solid #3A3B46;
  border-radius: 6.25rem;
`;
const PostTopBorder = styled.div`
  border-bottom: .063rem solid #3A3B46
`;
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
  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="posts" />
      {queryParam === 'self'
        && (
          <>
            <RoundButton className="w-100 bg-transparent border-0 p-md-0 pb-4 ">
              <StyledDiv className="d-flex justify-content-between px-2 py-2 bg-dark">
                <div>
                  <CommentProfileImage src="https://i.pravatar.cc/300?img=12" className="rounded-circle" />
                  <span className="ms-2 text-light fs-5">Create a post</span>
                </div>
                <div className="align-self-center me-2">
                  <FontAwesomeIcon role="button" icon={solid('camera')} size="lg" />
                </div>
              </StyledDiv>
            </RoundButton>
            <PostTopBorder className="d-md-none d-block" />
          </>
        )}
      <PostFeed postFeedData={postData} popoverOptions={popoverOptions} isCommentSection={false} />
    </AuthenticatedPageWrapper>
  );
}
export default ProfilePosts;
