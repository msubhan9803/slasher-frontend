import React from 'react';
import styled from 'styled-components';

const Advertisement = styled.div`
  height: 250px;
  width: 300px;
  background-color: #272727;
`;

function AdvertisementBox() {
  return (
    <div>
      <h2 className="mb-3">Advertisment</h2>
      <Advertisement className="mx-auto" />
    </div>
  );
}

export default AdvertisementBox;
