import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SliderThumb } from '@mui/material';


interface Props {
    children: React.ReactNode;
    ['data-index']: number
}

export default function RangeSliderThumbComponent({ children, ...other }: Props) {
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
