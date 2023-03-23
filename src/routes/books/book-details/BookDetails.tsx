import React from 'react';
import { Container } from 'react-bootstrap';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import { enableDevFeatures } from '../../../utils/configEnvironment';
import BooksRightSideNav from '../components/BooksRightSideNav';
import AboutBooks from './AboutBooks';

function BookDetails() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Container fluid className="mb-5">
          {enableDevFeatures && <RoundButton className="d-lg-none w-100 my-3">Add your book</RoundButton>}
          <AboutBooks />
        </Container>
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <BooksRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default BookDetails;
