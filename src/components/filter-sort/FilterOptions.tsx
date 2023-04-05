import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';

interface FilterProps {
  showKeys: boolean;
  setShowKeys: (val: boolean) => void;
  activeKey?: boolean;
  showSort?: boolean;
  buttonClass?: string;
  activeSort?: boolean;
}

const StyledFilterIcon = styled(FontAwesomeIcon)`
  width: 1.602rem;
  height: 1.25rem;
`;

const StyledFilterOptionButton = styled(Button)`
  &:focus-visible {
    box-shadow: 0 0 0 2px var(--stroke-and-line-separator-color) !important;
  }
`;
function FilterOptions({
  showKeys, setShowKeys, activeKey, showSort, buttonClass, activeSort,
}: FilterProps) {
  const handleFiltrOptions = () => {
    setShowKeys(!showKeys);
  };
  return (
    <>
      <StyledFilterOptionButton
        onClick={handleFiltrOptions}
        className={`${buttonClass} bg-transparent border-0 ${!showSort ? 'd-none d-lg-inline' : 'd-inline'} ${showKeys || activeKey ? 'text-primary' : 'text-white'}`}
      >
        Filter
        <StyledFilterIcon icon={solid('arrow-down-wide-short')} className="ms-2" />
      </StyledFilterOptionButton>
      {!showSort && (
        <StyledFilterOptionButton
          onClick={handleFiltrOptions}
          className={`py-3 bg-transparent border-0 d-lg-none ${showKeys || activeKey || activeSort ? 'text-primary' : 'text-white'}`}
        >
          <span className="">Sort/Filter</span>
          <StyledFilterIcon icon={solid('arrow-down-wide-short')} className="ms-2" size="lg" />
        </StyledFilterOptionButton>
      )}
    </>
  );
}

FilterOptions.defaultProps = {
  showSort: false,
  buttonClass: '',
  activeKey: false,
  activeSort: false,
};
export default FilterOptions;
