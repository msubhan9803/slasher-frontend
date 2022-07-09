import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledLink = styled(Link)`
  border-radius: 50rem;
`;

interface Props {
  children: React.ReactNode;
  className: string;
  variant: string;
  to: string;
  size?: string | null;
}

function RoundButtonLink({
  children, className, variant, to, size,
}: Props) {
  return (
    <StyledLink to={to} className={`btn ${size ? `btn-${size}` : ''} btn-${variant} ${className}`}>
      {children}
    </StyledLink>
  );
}

RoundButtonLink.defaultProps = {
  size: null,
};

export default RoundButtonLink;
