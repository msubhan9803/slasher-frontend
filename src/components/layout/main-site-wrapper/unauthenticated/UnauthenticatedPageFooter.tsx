import React from 'react';
import { Container } from 'react-bootstrap';
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
          {/* <a className="px-2" href={GOOGLE_PLAY_DOWNLOAD_URL}>Android App</a>
          <a className="px-2" href={APP_STORE_DOWNLOAD_URL}>iOS App</a> */}
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
