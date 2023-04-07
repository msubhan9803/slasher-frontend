import React from 'react';
import SortData from '../filter-sort/SortData';

interface CustomSelectProps {
  options: CustomOption[],
  label: string
}

interface CustomOption {
  label: string,
  value: string
}

function CustomSelect({
  options,
  label,
}: CustomSelectProps) {
  return (
    <>
      <p className="m-1">{label}</p>
      <SortData
        sortVal="Select one"
        onSelectSort={() => { }}
        sortoptions={[{ value: 'disabled', label: 'Select one' }, ...options]}
        type="form"
      />
    </>
  );
}

export default CustomSelect;
