import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';

interface Props {
  showKeys: any;
  setShowKeys: any;
}
function MoviesFilterOptions({ showKeys, setShowKeys }: Props) {
  return (
    <>
      <Button
        onClick={() => setShowKeys(!showKeys)}
        className={`bg-transparent border-0 d-none d-md-inline shadow-none ${showKeys ? 'text-primary' : 'text-white'}`}
      >
        Filter
        <FontAwesomeIcon icon={solid('arrow-down-wide-short')} className="ms-2" size="lg" />
      </Button>
      <Button
        onClick={() => setShowKeys(!showKeys)}
        className={`bg-transparent border-0 d-md-none shadow-none ${showKeys ? 'text-primary' : 'text-white'}`}
      >
        Sort/Filter
        <FontAwesomeIcon icon={solid('arrow-down-wide-short')} className="ms-2" size="lg" />
      </Button>
    </>
  );
}

export default MoviesFilterOptions;
