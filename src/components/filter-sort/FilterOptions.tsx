import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';

interface FilterProps {
  showKeys: boolean;
  setShowKeys: (val: boolean) => void;
  showSort?: boolean;
  buttonClass?: string;
}

const StyledFilterIcon = styled(FontAwesomeIcon)`
  width: 1.602rem;
  height: 1.25rem;
`;
function FilterOptions({
  showKeys, setShowKeys, showSort, buttonClass,
}: FilterProps) {
  return (
    <>
      <Button
        onClick={() => setShowKeys(!showKeys)}
        className={`${buttonClass} fs-3 bg-transparent border-0 ${!showSort ? 'd-none d-lg-inline' : 'd-inline'} shadow-none ${showKeys ? 'text-primary' : 'text-white'}`}
      >
        Filter
        <StyledFilterIcon icon={solid('arrow-down-wide-short')} className="ms-2" />
      </Button>
      {!showSort && (
      <Button
        onClick={() => setShowKeys(!showKeys)}
        className={`py-3 bg-transparent border-0 d-lg-none shadow-none ${showKeys ? 'text-primary' : 'text-white'}`}
      >
        <span className="fs-3">Sort/Filter</span>
        <StyledFilterIcon icon={solid('arrow-down-wide-short')} className="ms-2" size="lg" />
      </Button>
      )}
    </>
  );
}

FilterOptions.defaultProps = {
  showSort: false,
  buttonClass: '',
};
export default FilterOptions;
