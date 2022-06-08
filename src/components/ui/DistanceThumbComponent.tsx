import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SliderThumb } from '@mui/material';

export default function DistanceThumbComponent(props: any) {
  const { children, ...other } = props;
  return (
    <SliderThumb {...other}>
      {children}
      <FontAwesomeIcon icon={solid('chevron-right')} size="xs" color="white " />
    </SliderThumb>
  );
}
