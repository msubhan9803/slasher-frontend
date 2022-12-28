import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import UserCircleImage from '../../../ui/UserCircleImage';

interface Props {
  className?: string;
  photo: string;
  photoAlt: string;
  label: string;
  linkTo: string;
}

const StyledLink = styled(Link)`
  font-size: 0.875rem;
`;

function FriendCircleWithLabel({
  className, photo, photoAlt, label: userName, linkTo,
}: Props) {
  return (
    <StyledLink to={linkTo} className={`d-block text-center text-white ${className}`}>
      <UserCircleImage
        className="img-fluid rounded-circle mb-2"
        alt={photoAlt}
        src={photo}
        size="5.334rem"
      />
      <div className="overflow-hidden text-truncate">
        {userName}
      </div>
    </StyledLink>
  );
}

FriendCircleWithLabel.defaultProps = {
  className: '',
};

export default FriendCircleWithLabel;
