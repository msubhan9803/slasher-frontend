import React from 'react';
import styled from 'styled-components';

const Advertisement = styled.div`
  height: 15.625rem;
`;

function AdvertisementBox() {
  return (
    <>
      <h2 className="h4 my-3 ps-0">Advertisment</h2>
      <Advertisement className=" bg-dark mx-2" />
    </>
  );
}

export default AdvertisementBox;
