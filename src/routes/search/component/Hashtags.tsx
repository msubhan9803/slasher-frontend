import React from 'react';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { SearchProps } from '../SearchInterface';

const StyledHastagsCircle = styled.div`
  border-radius: 50%;
  height: 3.125rem;
  width: 3.125rem;
`;
function Hashtags({ name }: SearchProps) {
  return (
    <Row className="py-4 align-items-center">
      <Col xs="auto">
        <StyledHastagsCircle className="ms-md-2 bg-dark align-items-center d-flex fs-1 justify-content-around fw-light">#</StyledHastagsCircle>
      </Col>
      <Col xs="auto" className="ps-0 ps-md-5 ps-lg-3 ps-xl-0">
        <p className="fw-bold mb-0">
          #
          {name}
        </p>
        <small className="text-light mb-0">24.3M posts</small>
      </Col>
    </Row>
  );
}

export default Hashtags;
