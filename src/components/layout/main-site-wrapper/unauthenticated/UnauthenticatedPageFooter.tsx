import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledFooter = styled.footer`
  .container {
    border-top: 1px solid var(--bs-dark);
  }

  a {
    text-decoration: none;
    display:block;
  }
`;

function UnauthenticatedPageFooter() {
  return (
    <StyledFooter className="pt-5">
      <Container className="py-5">
        <div className="w-100 d-flex flex-wrap justify-content-evenly">
          <Link className="mb-2 px-2" to="/">About</Link>
          <Link className="mb-2 px-2" to="/">Help</Link>
          <Link className="mb-2 px-2" to="/">Terms of Service</Link>
          <Link className="mb-2 px-2" to="/">Privacy Policy</Link>
          <Link className="mb-2 px-2" to="/">Cookie Policy</Link>
          <Link className="mb-2 px-2" to="/">Site Rules</Link>
          <Link className="mb-2 px-2" to="/">Android App</Link>
          <Link className="mb-2 px-2" to="/">iOS App</Link>
          <div className="mb-2 px-2">
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
