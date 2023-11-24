import React from 'react';
import { Container, Image } from 'react-bootstrap';
import NowAvailableWorldwide from '../../../images/now-available-worldwide.png';
import DownloadStoreBadge from '../components/DownloadStoreBadge';

function NowAvailableSection() {
  return (
    <div className="mx-3 mx-lg-4 px-2">
      <Container>
        <div className="bg-primary d-flex justify-content-center rounded-3 p-4 text-black">
          <Image fluid src={NowAvailableWorldwide} alt="Slasher is now available worldwide" />
        </div>
        <div className="d-flex justify-content-center mt-4">
          <DownloadStoreBadge />
        </div>
      </Container>
    </div>
  );
}

export default NowAvailableSection;
