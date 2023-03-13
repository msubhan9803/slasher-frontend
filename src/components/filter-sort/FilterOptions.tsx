import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';

interface FilterProps {
  showKeys: boolean;
  setShowKeys: (val: boolean) => void;
  key?: string
  showSort?: boolean;
  buttonClass?: string;
}

const StyledFilterIcon = styled(FontAwesomeIcon)`
  width: 1.602rem;
  height: 1.25rem;
`;
function FilterOptions({
  showKeys, setShowKeys, key, showSort, buttonClass,
}: FilterProps) {
  const handleFiltrOptions = () => {
    setShowKeys(!showKeys);
  };
  return (
    <>
      <Button
        onClick={handleFiltrOptions}
        className={`${buttonClass} fs-3 bg-transparent border-0 ${!showSort ? 'd-none d-lg-inline' : 'd-inline'} ${showKeys || key !== '' ? 'text-primary' : 'text-white'}`}
      >
        Filter
        <StyledFilterIcon icon={solid('arrow-down-wide-short')} className="ms-2" />
      </Button>
      {!showSort && (
        <Button
          onClick={handleFiltrOptions}
          className={`py-3 bg-transparent border-0 d-lg-none ${showKeys || key !== '' ? 'text-primary' : 'text-white'}`}
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
  key: '',
};
export default FilterOptions;
