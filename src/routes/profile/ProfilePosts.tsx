import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Form, Image, InputGroup,
} from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PostFeed from '../../components/ui/PostFeed/PostFeed';
import postImage from '../../images/news-post.svg';
import ProfileHeader from './ProfileHeader';

const CommentProfileImage = styled(Image)`
  height:2.5rem;
  width:2.5rem;
`;
const StyledCommentInputGroup = styled(InputGroup)`
  .form-control {
    border-start:0rem
    border-radius: 1.875rem;
    border-bottom-right-radius: 0rem;
    border-top-right-radius: 0rem;
  }
  .input-group-text {
    background-color: rgb(31, 31, 31);
    border-color: #3a3b46;
    border-radius: 1.875rem;
  }
  svg {
    min-width: 1.875rem;
  }
`;

const postData = [
  {
    id: 1,
    userName: 'Aly khan',
    profileImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/18/2022 11:10 PM',
    content: 'Hell is empty and all the devils are here.',
    hashTag: ['horror', 'slasher', 'horroroasis'],
    postUrl: postImage,
    likeIcon: true,
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

function ProfilePosts() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <ProfileHeader />
      <div>
        <StyledCommentInputGroup className="mb-4">
          <InputGroup.Text className="py-0">
            <CommentProfileImage src="https://i.pravatar.cc/300?img=12" className="rounded-circle" />
          </InputGroup.Text>
          <Form.Control
            placeholder="Create post"
            className="border-end-0 border-start-0"
          />
          <InputGroup.Text>
            <FontAwesomeIcon role="button" icon={solid('camera')} size="lg" />
          </InputGroup.Text>
        </StyledCommentInputGroup>
      </div>
      <PostFeed postFeedData={postData} />
    </AuthenticatedPageWrapper>
  );
}
export default ProfilePosts;
