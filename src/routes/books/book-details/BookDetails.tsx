import React from 'react';
import { Container } from 'react-bootstrap';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import BooksRigthSideNav from '../components/BooksRigthSideNav';
import AboutBooks from './AboutBooks';

function BookDetails() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Container fluid className="mb-5">
          <RoundButton className="d-lg-none w-100 my-3 fs-3 fw-bold">Add your book</RoundButton>
          <AboutBooks />
        </Container>
      </ContentPageWrapper>
      <RightSidebarWrapper className="pb-3 d-none d-lg-block">
        <BooksRigthSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default BookDetails;
