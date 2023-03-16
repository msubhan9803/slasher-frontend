import React from 'react';
import { Image } from 'react-bootstrap';
import USFlagImage from '../../../images/united-states.png';
import CanadaFlagImage from '../../../images/canada-flag.png';

function AvailableSection() {
  return (
    <div className="text-center p-3 my-3">
      <h1 className="h3 mb-3 p-2">AVAILABLE NOW IN THE</h1>
      <div className="p-2 d-flex align-items-center mb-3 justify-content-center">
        <span className="d-flex align-items-center me-4">
          <Image src={USFlagImage} alt="United States" />
          <p className="h3 mb-0 ms-3">United States</p>
        </span>
        <span className="d-flex align-items-center">
          <Image src={CanadaFlagImage} alt="Canada" />
          <p className="h3 mb-0 ms-3">Canada</p>
        </span>
      </div>
      <h2 className="fw-bold m-0 p-2">COMING SOON WORLDWIDE</h2>
    </div>
  );
}

export default AvailableSection;
