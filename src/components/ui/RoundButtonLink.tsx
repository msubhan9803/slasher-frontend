import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledLink = styled(Link)`
  border-radius: 50rem;
`;

const StyledAnchor = styled.a`
  border-radius: 50rem;
`;

interface Props {
  children: React.ReactNode;
  usePlainAnchorTag?: boolean;
  className?: string;
  style?: React.CSSProperties;
  variant: string;
  to: string;
  size?: string | null;
  state?: any;
  handleClick?: () => void;
}

function RoundButtonLink({
  children, usePlainAnchorTag, className, variant, to, size, state, handleClick, style,
}: Props) {
  return (
    // If href is supplied, make this an anchor tag instead of a react router link.
    // Note: Anchor tags do not support the state prop.
    usePlainAnchorTag
      ? (
        <StyledAnchor onClick={handleClick} href={to} className={`btn ${size ? `btn-${size}` : ''} btn-${variant} ${className}`} style={style}>
          {children}
        </StyledAnchor>
      )
      : (
        <StyledLink onClick={handleClick} to={to} state={state} className={`btn ${size ? `btn-${size}` : ''} btn-${variant} ${className}`} style={style}>
          {children}
        </StyledLink>
      )
  );
}

RoundButtonLink.defaultProps = {
  size: null,
  state: null,
  className: '',
  style: {},
  handleClick: undefined,
  usePlainAnchorTag: false,
};

export default RoundButtonLink;
