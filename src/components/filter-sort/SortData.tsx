import React from 'react';
import { Form } from 'react-bootstrap';
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
const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    background: 'var(--bs-dark)',
    borderRadius: '20px',
    border: '1px solid #3A3B46',
    boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(255, 24, 0, 0.25)' : null,
    paddingRight: 20,
    '&:hover': {
      border: 'none',
    },
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'black',
    color: '#ffffff',
    borderRadius: '10',
    border: '1px solid #ffffff',
    marginTop: 0,
  }),
  menuList: (base: any) => ({
    ...base,
    padding: 0,
  }),
  '&:hover': {
    color: 'black',
  },
};
function SortData({
  title, sortoptions, type, onSelectSort, sortVal,
}: SortDataProps) {
  const options = sortoptions!.map(({ value, label }) => ({ value, label: title + label })) || [];

  return (
    <Form>
      <StyledSelect
        value={options.find((option) => option.value === sortVal)}
        onChange={(selectedOption: any) => onSelectSort!(selectedOption.value)}
        className="fs-5"
        options={type === 'select' ? [{ value: '', label: 'Select categories' }, ...options] : options}
        placeholder={type === 'select' ? 'Select categories' : ''}
        components={{ IndicatorSeparator: () => null }}
        styles={customStyles}
      />
    </Form>
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
