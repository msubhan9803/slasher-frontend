import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import RoundButton from '../../../../components/ui/RoundButton';

interface TutorialButtonProps {
  nextLink: string
}
const StyledNextButton = styled(RoundButton)`
  width: 13.067rem; 
  @media (max-width: 600px) {
    width: 100%;
  }
`;
function TutorialButtons({ nextLink }: TutorialButtonProps) {
  return (
    <div className="d-flex justify-content-center mt-3">
      <Link to={`/dating/tutorial/${nextLink}`}>
        <StyledNextButton variant="primary" className="fs-3">
          Next
        </StyledNextButton>
      </Link>
    </div>
  );
}

export default TutorialButtons;
