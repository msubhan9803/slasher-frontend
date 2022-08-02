import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button } from 'react-bootstrap';

interface FilterProps {
  showKeys: any;
  setShowKeys: any;
}
function FilterOptions({ showKeys, setShowKeys }: FilterProps) {
  return (
    <>
      <Button
        onClick={() => setShowKeys(!showKeys)}
        className={`bg-transparent border-0 d-none d-lg-inline shadow-none ${showKeys ? 'text-primary' : 'text-white'}`}
      >
        Filter
        <FontAwesomeIcon icon={solid('arrow-down-wide-short')} className="ms-2" size="lg" />
      </Button>
      <Button
        onClick={() => setShowKeys(!showKeys)}
        className={`bg-transparent border-0 d-lg-none shadow-none ${showKeys ? 'text-primary' : 'text-white'}`}
      >
        Sort/Filter
        <FontAwesomeIcon icon={solid('arrow-down-wide-short')} className="ms-2" size="lg" />
      </Button>
    </>
  );
}

export default FilterOptions;
