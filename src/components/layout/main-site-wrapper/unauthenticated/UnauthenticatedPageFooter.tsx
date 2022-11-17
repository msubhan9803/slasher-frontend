import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledFooter = styled.footer`
  .footer-container {
    border-top: 1px solid var(--slasher-comments-bg-color);
  }
  a {
    text-decoration: none;
    display:block;
    color: var(--text-white);
  }
`;

function UnauthenticatedPageFooter() {
  return (
    <StyledFooter>
      <Container fluid="lg" className="footer-container py-4">
        <div className="w-100 d-flex flex-wrap justify-content-evenly">
          <Link className="px-2" to="/">About</Link>
          <Link className="px-2" to="/">Help</Link>
          <Link className="px-2" to="/">Terms of Service</Link>
          <Link className="px-2" to="/">Privacy Policy</Link>
          <Link className="px-2" to="/">Cookie Policy</Link>
          <Link className="px-2" to="/">Site Rules</Link>
          <Link className="px-2" to="/">Android App</Link>
          <Link className="px-2" to="/">iOS App</Link>
          <div className="px-2">
            &copy;
            {' '}
            {new Date().getFullYear()}
            {' '}
            Slasher Corp
          </div>
        </div>
      </Container>
    </StyledFooter>
  );
}
export default UnauthenticatedPageFooter;
