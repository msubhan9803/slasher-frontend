import React from 'react';
import Select from 'react-select';
import styled from 'styled-components';

interface SortDataProps {
  title?: string;
  sortoptions?: OptionsProps[];
  type?: string;
  onSelectSort?(value: string): void | null;
  sortVal?: string
}
interface OptionsProps {
  value: string;
  label: string;
}

const StyledSelect = styled(Select)`
  .css-1dimb5e-singleValue {
    color: #ffffff !important;
  }
`;
function SortData({
  title, sortoptions, type, onSelectSort, sortVal,
}: SortDataProps) {
  const options = sortoptions!.map(({ value, label }) => ({ value, label: title + label })) || [];

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      background: 'var(--bs-dark)',
      borderRadius: '20px',
      border: '1px solid #3A3B46',
      boxShadow: state.isFocused ? '0 0 0 1px var(--stroke-and-line-separator-color)' : null,
      paddingLeft: 5,
      '&:hover': {
        border: '1px solid #3A3B46',
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'var(--bs-secondary)',
      color: '#ffffff',
      borderRadius: '10',
      border: '1px solid #ffffff',
      marginTop: 0,
    }),
    menuList: (base: any) => ({
      ...base,
      padding: 0,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused || (state.isFocused && state.isSelected) ? 'var(--bs-primary)' : null,
      color: state.isFocused || (state.isFocused && state.isSelected) ? 'var(--bs-secondary)' : null,
      '&:hover': {
        backgroundColor: 'var(--bs-primary)',
        color: 'var(--bs-secondary)',
      },
      '&:focus-visible': {
        backgroundColor: 'var(--bs-primary)',
        color: 'var(--bs-secondary)',
      },
    }),
  };

  return (
    <StyledSelect
      value={options.find((option) => option.value === sortVal)}
      onChange={(selectedOption: any) => onSelectSort!(selectedOption.value)}
      className="fs-5"
      options={type === 'select' ? [{ value: '', label: 'Select categories' }, ...sortoptions!] : sortoptions}
      placeholder={type === 'select' ? 'Select categories' : ''}
      components={{ IndicatorSeparator: () => null }}
      styles={customStyles}
      isSearchable={false}
    />
  );
}

SortData.defaultProps = {
  title: '',
  sortoptions: [],
  type: '',
  onSelectSort: null,
  sortVal: 'name',
};

export default SortData;
