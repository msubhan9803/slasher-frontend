import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import UserCircleImage from './UserCircleImage';
import RoundButtonLink from './RoundButtonLink';
import { useAppSelector } from '../../redux/hooks';

interface CreatePostProps {
  label?: string;
  icon?: IconDefinition;
  iconClass?: string;
  className?: string;
  handleCreateInput?: () => void;
}

const StyledRoundButtonLink = styled(RoundButtonLink)`
  border: 1px solid #3A3B46;
  border-radius: 6.25rem;
`;
function CustomCreatePost({
  label, icon, iconClass, className, handleCreateInput,
}: CreatePostProps) {
  const userProfilePic = useAppSelector((state) => state.user.user.profilePic);
  return (
    <StyledRoundButtonLink handleClick={handleCreateInput} to={handleCreateInput ? '?view=self' : '/app/posts/create'} variant="dark" className={`w-100 d-flex justify-content-between ${className}`}>
      <div>
        <UserCircleImage size="2.5rem" src={userProfilePic} alt="user picture" />
        <span className="ms-2 text-light fs-5">{label}</span>
      </div>
      <div className="align-self-center me-2">
        <FontAwesomeIcon role="button" icon={icon!} size="lg" className={iconClass} />
      </div>
    </StyledRoundButtonLink>
  );
}

CustomCreatePost.defaultProps = {
  label: 'Create a post',
  icon: solid('camera'),
  iconClass: 'text-white',
  className: '',
  handleCreateInput: undefined,
};

export default CustomCreatePost;
