import React from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function WorthContent() {
  return (
    <>
      <div className="rounded-circle p-3 me-2 d-flex align-items-center justify-content-center">
        <FontAwesomeIcon icon={regular('thumbs-up')} size="lg" />
      </div>
      <p className="fs-2 fw-bold m-0">Worth it!</p>
    </>
  );
}

export default WorthContent;
