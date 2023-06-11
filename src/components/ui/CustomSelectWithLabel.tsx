import React from 'react';
import CustomSelect from '../filter-sort/CustomSelect';

interface Option { label: string, value: string }
interface Props {
  options: Option[],
  label: string
}

function CustomSelectWithLabel({
  options,
  label,
}: Props) {
  return (
    <>
      <p className="m-1">{label}</p>
      <CustomSelect
        value="Select one"
        onChange={() => { }}
        options={[{ value: 'disabled', label: 'Select one' }, ...options]}
        type="form"
      />
    </>
  );
}

export default CustomSelectWithLabel;
