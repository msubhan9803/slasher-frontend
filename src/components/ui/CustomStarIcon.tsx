import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

const StyledStar = styled(FontAwesomeIcon)`
  color: #FF8A00;
  width: 1.638rem;
  height: 1.563rem;
`;
function CustomStarIcon() {
  return (
    <StyledStar icon={solid('star')} size="xs" className="star mb-2" />
  );
}
export default CustomStarIcon;
