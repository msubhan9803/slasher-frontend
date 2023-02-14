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

interface Props {
  linkParams?: string;
}

function CustomCreatePost({ linkParams }: Props) {
  const userProfilePic = useAppSelector((state) => state.user.user.profilePic);
  return (
    <StyledRoundButtonLink to={`/app/posts/create${linkParams}`} variant="dark" className="w-100 d-flex justify-content-between">
      <div>
        <UserCircleImage size="2.5rem" src={userProfilePic} />
        <span className="ms-2 text-light fs-5">Create a post</span>
      </div>
      <div className="align-self-center me-2">
        <FontAwesomeIcon role="button" icon={solid('camera')} size="lg" className="text-white" />
      </div>
    </StyledRoundButtonLink>
  );
}

CustomCreatePost.defaultProps = {
  linkParams: '',
};

export default CustomCreatePost;
