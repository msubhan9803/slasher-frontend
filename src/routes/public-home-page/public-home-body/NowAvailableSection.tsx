import React from 'react';
import { Container, Image } from 'react-bootstrap';
import NowAvailableWorldwide from '../../../images/now-available-worldwide.png';

function NowAvailableSection() {
  return (
    <div className="mx-3 mx-lg-4 px-2">
      <Container>
        <div className="bg-primary rounded-3 p-4 text-black">
          <Image fluid src={NowAvailableWorldwide} alt="Slasher is now available worldwide" />
        </div>
      </Container>
    </div>
  );
}

export default NowAvailableSection;
