import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useLocation } from 'react-router-dom';
import UserCircleImage from './UserCircleImage';
import RoundButtonLink from './RoundButtonLink';
import { useAppSelector } from '../../redux/hooks';

interface CreatePostProps {
  label?: string;
  icon?: IconDefinition;
  iconClass?: string;
  className?: string;
  handleCreateInput?: () => void;
  linkParams?: string;
}

const StyledRoundButtonLink = styled(RoundButtonLink)`
  border: 1px solid #3A3B46;
  border-radius: 6.25rem;
`;

const StyledRoundButton = styled.div`
  border: 1px solid #3A3B46;
  border-radius: 6.25rem;
`;

function CustomCreatePost({
  label, icon, iconClass, className, handleCreateInput, linkParams,
}: CreatePostProps) {
  const userProfilePic = useAppSelector((state) => state.user.user.profilePic);
  const { pathname } = useLocation();

  return !linkParams && handleCreateInput ? (
    <StyledRoundButton
      onClick={handleCreateInput}
      className={`btn btn-black w-100 d-flex justify-content-between ${className}`}
    >
      <div>
        <UserCircleImage size="1.4rem" src={userProfilePic} alt="user picture" />
        <span className="ms-2 text-light">{label}</span>
      </div>
      <div className="align-self-center me-2">
        <FontAwesomeIcon role="button" icon={icon!} size="lg" className={iconClass} />
      </div>
    </StyledRoundButton>
  ) : (
    <StyledRoundButtonLink
      handleClick={handleCreateInput}
      state={pathname}
      to={handleCreateInput ? `${linkParams}` : `/app/posts/create${linkParams}`}
      variant="black"
      className={`w-100 d-flex justify-content-between ${className}`}
    >
      <div>
        <UserCircleImage size="1.4rem" src={userProfilePic} alt="user picture" />
        <span className="ms-2 text-light">{label}</span>
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
  linkParams: '',
};

export default CustomCreatePost;
