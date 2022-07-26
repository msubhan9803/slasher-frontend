import React from 'react';
import styled from 'styled-components';

const Advertisement = styled.div`
  height: 250px;
  width: 300px;
  background-color: #272727;
`;

function AdvertisementBox() {
  return (
    <>
      <h2 className="h3 mb-3">Advertisement</h2>
      <Advertisement className="mx-auto" />
    </>
  );
}

export default AdvertisementBox;
