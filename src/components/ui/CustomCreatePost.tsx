import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import UserCircleImage from './UserCircleImage';
import RoundButtonLink from './RoundButtonLink';
import { useAppSelector } from '../../redux/hooks';

const StyledRoundButtonLink = styled(RoundButtonLink)`
  border: 1px solid #3A3B46;
  border-radius: 6.25rem;
`;
function CustomCreatePost() {
  const userProfilePic = useAppSelector((state) => state.user.user.profilePic);
  return (
    <StyledRoundButtonLink to="/app/posts/create" variant="dark" className="w-100 d-flex justify-content-between">
      <div>
        <UserCircleImage size="2.5rem" src={userProfilePic} alt="user picture" />
        <span className="ms-2 text-light fs-5">Create a post</span>
      </div>
      <div className="align-self-center me-2">
        <FontAwesomeIcon role="button" icon={solid('camera')} size="lg" className="text-white" />
      </div>
    </StyledRoundButtonLink>
  );
}

export default CustomCreatePost;
