import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledFooterContainer = styled(Container)`
  border-top: 1px solid var(--bs-dark);

  a {
    text-decoration: none;
    display:block;
  }
`;

function UnauthenticatedSiteFooter() {
  return (
    <StyledFooterContainer className="py-5">
      <div className="w-100 d-flex justify-content-between">
        <Link to="/">About</Link>
        <Link to="/">Help</Link>
        <Link to="/">Terms of Service</Link>
        <Link to="/">Privacy Policy</Link>
        <Link to="/">Cookie Policy</Link>
        <Link to="/">Site Rules</Link>
        <Link to="/">Android App</Link>
        <Link to="/">iOS App</Link>
        <div className="slasher-copyright-text">
          &copy;
          {' '}
          {new Date().getFullYear()}
          {' '}
          Slasher Corp
        </div>
      </div>
    </StyledFooterContainer>
  );
}
export default UnauthenticatedSiteFooter;
