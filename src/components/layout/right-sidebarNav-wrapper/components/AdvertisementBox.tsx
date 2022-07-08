import React from 'react';
import { Row } from 'react-bootstrap';
import styled from 'styled-components';

const Advertisement = styled.div`
  height: 15.625rem;
`;

function AdvertisementBox() {
  return (
    <Row className="d-none d-md-flex">
      <h1 className="h4 my-3 ps-0">Advertisment</h1>
      <Advertisement className=" bg-dark " />
    </Row>
  );
}

export default AdvertisementBox;
