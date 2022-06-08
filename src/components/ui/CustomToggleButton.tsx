import React from 'react';

interface Props {
  id: string;
  label: string;
  value: string;
  checked: boolean;
  type: 'checkbox' | 'radio',
  variant: string,
  className?: string,
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void | undefined
}

function CustomToggleButton({
  id, label, value, checked, type, variant, className, onChange,
}: Props) {
  return (
    <div>
      <input type={type} checked={checked} className="btn-check" id={id} value={value} onChange={onChange} />
      <label className={`btn btn-${variant} ${className}`} htmlFor={id}>
        {label}
      </label>
    </div>
  );
}

CustomToggleButton.defaultProps = {
  onChange: undefined,
  className: '',
};

export default CustomToggleButton;
