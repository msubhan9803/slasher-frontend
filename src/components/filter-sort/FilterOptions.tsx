import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';

interface FilterProps {
  showKeys: any;
  setShowKeys: any;
}

const StyledFilterIcon = styled(FontAwesomeIcon)`
  width: 1.602rem;
  height: 1.25rem;
`;
function FilterOptions({ showKeys, setShowKeys }: FilterProps) {
  return (
    <>
      <Button
        onClick={() => setShowKeys(!showKeys)}
        className={`fs-3 bg-transparent border-0 d-none d-lg-inline shadow-none ${showKeys ? 'text-primary' : 'text-white'}`}
      >
        Filter
        <StyledFilterIcon icon={solid('arrow-down-wide-short')} className="ms-2" />
      </Button>
      <Button
        onClick={() => setShowKeys(!showKeys)}
        className={`pt-0 pb-3 bg-transparent border-0 d-lg-none shadow-none ${showKeys ? 'text-primary' : 'text-white'}`}
      >
        Sort/Filter
        <StyledFilterIcon icon={solid('arrow-down-wide-short')} className="ms-2" size="lg" />
      </Button>
    </>
  );
}

export default FilterOptions;
