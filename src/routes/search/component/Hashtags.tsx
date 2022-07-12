import React from 'react';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';

const StyledHastagsCircle = styled.div`
  border-radius: 50%;
  height: 3.75rem;
  width: 3.75rem;
`;
function Hashtags({ hashtag }: any) {
  return (
    <Row className="py-4 align-items-center">
      <Col xs={3} sm={2} lg={4}>
        <StyledHastagsCircle className="ms-md-2 bg-dark align-items-center d-flex fs-1 justify-content-around fw-light">#</StyledHastagsCircle>
      </Col>
      <Col xs={9} sm={10} md={8} className="ps-0 ps-md-5 ps-lg-3 ps-xl-0">
        <h2 className="h5 mb-0">
          #
          {hashtag.name}
        </h2>
        <p className="small text-light mb-0">24.3M posts</p>
      </Col>
    </Row>
  );
}

export default Hashtags;
