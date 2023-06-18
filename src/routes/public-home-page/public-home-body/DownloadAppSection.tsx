import React from 'react';
import { Image } from 'react-bootstrap';
import NowAvailableWorldwide from '../../../images/now-available-worldwide.png';

function DownloadAppSection() {
  return (
    <div className="mx-3 mx-lg-4 px-2">
      <div className="bg-primary rounded-3 p-4 text-black">
        <Image fluid src={NowAvailableWorldwide} alt="Slasher is now available worldwide" />
      </div>
    </div>
  );
}

export default DownloadAppSection;
