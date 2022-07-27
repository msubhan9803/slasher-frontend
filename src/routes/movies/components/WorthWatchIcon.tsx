import React, { useState } from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';

const StyledOnLikedIcon = styled(RoundButton)`
  color: #00FF0A;
  border: 0.063rem solid #00FF0A;
  width: 1.875rem;
  height: 1.875rem;
  &:hover {
    color: #00FF0A;
    border: 0.063rem solid #00FF0A;
  }  
  svg {
    margin-left: 0.125rem;
    margin-top: -0.063rem;
  }
`;
const StyledLikeIcon = styled(RoundButton)`
  color: #00FF0A;
  border: 0.063rem solid #3A3B46;
  width: 1.875rem;
  height: 1.875rem;
  &:hover {
    color: #00FF0A;
    border: 0.063rem solid #3A3B46;
  }
  svg {
    margin-left: 0.125rem;
    margin-top: -0.063rem;
  }
`;
const StyledOnDisLikeIcon = styled(RoundButton)`
  color: #FF1800;
  border: 0.063rem solid #FF1800;
  transform: rotateY(180deg);
  width: 1.875rem;
  height: 1.875rem;
  &:hover {
    color: #FF1800;
    border: 0.063rem solid #FF1800;
  } 
  svg {
    margin-left: -0.063rem;
  }
`;
const StyledDisLikeIcon = styled(RoundButton)`
  color: #FF1800;
  border: 0.063rem solid #3A3B46;
  transform: rotateY(180deg);
  width: 1.875rem;
  height: 1.875rem;
  &:hover {
    color: #FF1800;
    border: 0.063rem solid #3A3B46;
  } 
  svg {
    margin-left: -0.063rem;
  }
`;
const StyleWatchWorthIcon = styled(FontAwesomeIcon)`
width: 0.995rem;
height: 0.997rem;
`;
function WorthWatchIcon() {
  const [liked, setLike] = useState(false);
  const [disLiked, setDisLike] = useState(false);
  return (
    <div className="mx-1 d-flex align-items-center justify-content-between">
      <span className="align-items-center d-flex me-xl-0">
        {liked ? (
          <StyledOnLikedIcon onClick={() => setLike(false)} className="d-flex justify-content-center shadow-none bg-transparent me-1 rounded-circle">
            <StyleWatchWorthIcon icon={regular('thumbs-up')} />
          </StyledOnLikedIcon>
        ) : (
          <StyledLikeIcon onClick={() => { setLike(true); setDisLike(false); }} className="d-flex justify-content-center shadow-none bg-transparent me-1 rounded-circle">
            <StyleWatchWorthIcon icon={regular('thumbs-up')} />
          </StyledLikeIcon>
        )}
        <p className="m-0 text-light">(10K)</p>
      </span>
      <span className="align-items-center d-flex ms-3">
        {disLiked ? (
          <StyledOnDisLikeIcon onClick={() => setDisLike(false)} className="shadow-none bg-transparent me-1 px-2 py-1 rounded-circle">
            <StyleWatchWorthIcon icon={regular('thumbs-down')} />
          </StyledOnDisLikeIcon>
        ) : (
          <StyledDisLikeIcon onClick={() => { setDisLike(true); setLike(false); }} className="shadow-none bg-transparent me-1 px-2 py-1 rounded-circle">
            <StyleWatchWorthIcon icon={regular('thumbs-down')} />
          </StyledDisLikeIcon>
        )}
        <p className="m-0 text-light">(2K)</p>
      </span>
    </div>
  );
}

export default WorthWatchIcon;
