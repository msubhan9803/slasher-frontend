import React from 'react';
import { Container } from 'react-bootstrap';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import BooksRightSideNav from '../components/BooksRightSideNav';
import AboutBooks from './AboutBooks';
import { enableDevFeatures } from '../../../env';

function BookDetails() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Container fluid className="mb-5">
          {enableDevFeatures
            && (
            <>
              <RoundButton className="d-lg-none w-100 my-3">Add your book</RoundButton>
              <h1 className="text-center text-primary h3 d-lg-none">Claim this listing</h1>
            </>
            )}
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
