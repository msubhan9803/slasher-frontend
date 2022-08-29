import React from 'react';
import { Container } from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import AboutBooks from './AboutBooks';

function BookDetails() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="book">
      <Container fluid className="mb-5">
        <RoundButton className="d-lg-none w-100 my-3 fs-3 fw-bold">Add your book</RoundButton>
        <AboutBooks />
      </Container>
    </AuthenticatedPageWrapper>
  );
}

export default BookDetails;
