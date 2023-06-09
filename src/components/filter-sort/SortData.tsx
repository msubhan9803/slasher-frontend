import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import styled from 'styled-components';

interface SortDataProps {
  sortoptions?: OptionsProps[];
  type?: string;
  onSelectSort?(value: any): void | null;
  sortVal?: string | number;
  placeholder?: string;
}
interface OptionsProps {
  value: number | string;
  label: number | string;
}

const StyledSelect = styled(Select)`
  .css-1dimb5e-singleValue {
    color: #ffffff !important;
  }
`;

function SortData({
  sortoptions, type, onSelectSort, sortVal, placeholder,
}: SortDataProps) {
  const [selectedSortVal, setSelectedSortVal] = useState<any>();

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      background: 'var(--bs-dark)',
      borderRadius: type === 'form' ? '0.375rem' : '20px',
      border: '1px solid #3A3B46',
      boxShadow: state.isFocused ? '0 0 0 2px var(--stroke-and-line-separator-color)' : null,
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
      maxHeight: '150px',
    }),
    option: (base: any, state: any) => {
      const getBackgroundColor = () => {
        if (state.isSelected) {
          return 'var(--bs-primary)';
        } if (state.isFocused) {
          return 'var(--primary-light)';
        }
        return null;
      };

      const getColor = () => {
        if (state.isSelected) {
          return 'var(--bs-secondary)';
        } if (state.isFocused) {
          return '#000000';
        }
        return null;
      };

      return {
        ...base,
        backgroundColor: getBackgroundColor(),
        color: getColor(),
        '&:hover': {
          backgroundColor: state.isSelected ? 'var(--bs-primary)' : 'var(--primary-light)',
          color: state.isSelected ? 'var(--bs-secondary)' : '#000',
        },
        '&:focus': {
          backgroundColor: 'var(--bs-primary)',
          color: 'var(--bs-secondary)',
        },
      };
    },
  };
  useEffect(() => {
    setSelectedSortVal(sortVal!);
  }, [sortVal]);
  // useEffect(() => {
  //   if (sortoptions![0]?.label === 'Day') {
  //     debugger
  //     const updateValue = typeof sortVal! === 'number' && sortVal! > sortoptions!.length - 1 ? sortoptions!.length - 1 : sortVal;
  //     setSelectedSortVal(updateValue);
  //   }
  // }, [sortoptions, sortVal]);
  return (
    <StyledSelect
      value={sortoptions!.find((option) => option.value === selectedSortVal)}
      onChange={(selectedOption: any) => {
        onSelectSort!(selectedOption.value);
        setSelectedSortVal(selectedOption.value);
      }}
      className="fs-5"
      options={sortoptions}
      placeholder={placeholder || ''}
      styles={customStyles}
      isSearchable={false}
      isOptionDisabled={(option: any) => option.value === 0}
      components={{ IndicatorSeparator: () => null }}
    />
  );
}

SortData.defaultProps = {
  sortoptions: [],
  type: '',
  onSelectSort: null,
  sortVal: 'name' || 0,
  placeholder: undefined,
};

export default SortData;
