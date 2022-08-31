import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SliderThumb } from '@mui/material';

interface Props {
  children: React.ReactNode,
}
export default function SliderThumbComponent({ children, ...other }: Props) {
  return (
    <SliderThumb {...other}>
      {children}
      <FontAwesomeIcon icon={solid('chevron-right')} size="xs" color="black" />
    </SliderThumb>
  );
}
