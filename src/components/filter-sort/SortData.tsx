import React from 'react';
import Select from 'react-select';
import styled from 'styled-components';

interface SortDataProps {
  sortoptions?: OptionsProps[];
  type?: string;
  onSelectSort?(value: string): void | null;
  sortVal?: string;
  placeholder?: string;
}
interface OptionsProps {
  value: any;
  label: any;
}

const StyledSelect = styled(Select)`
  .css-1dimb5e-singleValue {
    color: #ffffff !important;
  }
`;

function SortData({
  sortoptions, type, onSelectSort, sortVal, placeholder,
}: SortDataProps) {
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

  return (
    <StyledSelect
      defaultValue={sortoptions![0] || sortVal} // ==>> current code in main branch
      // defaultValue={sortoptions?.filter((sortoption) => sortoption.value === sortVal)}
      // - 1. ABOVE two cases doesn't work when `sortVal` is updated in any parent component.
      // - -. because `defaultValue` is usually used for uncontrolled component and `value` is used
      // - -. in controlled component.
      //
      // Should we consider using `value` now on instead of `defaultValue`
      // - 2. Using `value` works good as the menu is updated when `sortVal` is updated in parent
      // - -. too.
      // value={sortoptions?.filter((sortoption) => sortoption.value === sortVal)}
      onChange={(selectedOption: any) => onSelectSort!(selectedOption.value)}
      className="fs-5"
      options={sortoptions}
      placeholder={placeholder || ''}
      styles={customStyles}
      isSearchable={false}
      isOptionDisabled={(option: any) => option.value === 'disabled'}
      components={{ IndicatorSeparator: () => null }}
    />
  );
}

SortData.defaultProps = {
  sortoptions: [],
  type: '',
  onSelectSort: null,
  sortVal: 'name',
  placeholder: undefined,
};

export default SortData;
