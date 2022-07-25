import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { SearchProps } from '../SearchInterface';

const StyledHastagsCircle = styled(Image)`
  border-radius: 50%;
  height: 3.125rem;
  width: 3.125rem;
`;
function People({
  name, image, email,
}: SearchProps) {
  return (
    <Row className="py-4 align-items-center">
      <Col xs="auto">
        <StyledHastagsCircle className="ms-md-2 bg-dark align-items-center d-flex fs-1 justify-content-around fw-light" src={image} />
      </Col>
      <Col xs="auto" className="ps-0 ps-md-5 ps-lg-3 ps-xl-0">
        <p className="fw-bold mb-0">
          {name}
        </p>
        <p className="small text-light mb-0">{email}</p>
      </Col>
    </Row>
  );
}

export default People;
