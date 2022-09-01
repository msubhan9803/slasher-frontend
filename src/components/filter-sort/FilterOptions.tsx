import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';

interface FilterProps {
  showKeys: boolean;
  setShowKeys: (val: boolean) => void;
}

const StyledFilterIcon = styled(FontAwesomeIcon)`
  width: 1.602rem;
  height: 1.25rem;
`;
function FilterOptions({ showKeys, setShowKeys }: FilterProps) {
  return (
    <>
      <Button
        variant="link"
        onClick={() => setShowKeys(!showKeys)}
        className={`fs-3 bg-transparent d-none d-lg-inline ${showKeys ? 'text-primary' : 'text-white'}`}
      >
        Filter
        <StyledFilterIcon icon={solid('arrow-down-wide-short')} className="ms-2" />
      </Button>
      <Button
        variant="link"
        onClick={() => setShowKeys(!showKeys)}
        className={`py-3 bg-transparent d-lg-none ${showKeys ? 'text-primary' : 'text-white'}`}
      >
        <span className="fs-3">Sort/Filter</span>
        <StyledFilterIcon icon={solid('arrow-down-wide-short')} className="ms-2" size="lg" />
      </Button>
    </>
  );
}

export default FilterOptions;
