import { Slider } from '@mui/material';
import styled from 'styled-components';

const CustomSlider = styled(Slider)`
.MuiSlider-rail {
  color: #3A3B46;
  border-radius: 0;
  height: .3rem;
}
.MuiSlider-track {
  color: var(--bs-primary);
  border-radius: 0;
  height: .3rem;
}
.MuiSlider-thumb {
  color: var(--bs-primary);
  width: 1.87rem;
  height: 1.87rem;
}
`;

export default CustomSlider;
