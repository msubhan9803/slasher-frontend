import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SliderThumb } from '@mui/material';

export default function AgeThumbComponent(props: any) {
  const { children, ...other } = props;
  const extraClassName = other['data-index'] === 0 ? 'first-thumb' : 'second-thumb';
  if (extraClassName === 'first-thumb') {
    return (
      <SliderThumb {...other}>
        {children}
        <FontAwesomeIcon icon={solid('chevron-left')} size="xs" color="white " />
      </SliderThumb>
    );
  }
  return (
    <SliderThumb {...other}>
      {children}
      <FontAwesomeIcon icon={solid('chevron-right')} size="xs" color="white " />
    </SliderThumb>
  );
}
