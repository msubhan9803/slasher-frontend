import React, { useState } from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

interface LikeProps {
  isLike?: boolean;
  width?: string;
  height?: string;
}
interface DislikeProps {
  isDislike?: boolean
  width?: string;
  height?: string;
}

export const StyledDislikeIcon = styled.div <DislikeProps>`
  color: #FF1800;
  width: ${(props) => (props.width ? props.width : '1.875rem')};
  height: ${(props) => (props.width ? props.height : '1.875rem')};
  transform: rotateY(180deg);
  ${(props) => (props.isDislike ? ' border: 1px solid #FF1800' : ' border: 1px solid #3A3B46')};
  FontAwesomeIcon {
    width: 1.326rem;
    height: 1.391rem;
  }
  &:hover {
    color: #FF1800;
    ${(props) => (props.isDislike ? ' border: 1px solid #FF1800' : ' border: 1px solid #3A3B46')};
  } 
`;
export const StyledLikeIcon = styled.div <LikeProps>`
  color: #00FF0A;
  width: ${(props) => (props.width ? props.width : '1.875rem')};
  height: ${(props) => (props.width ? props.height : '1.875rem')};
  ${(props) => (props.isLike ? ' border: 1px solid #00FF0A' : ' border: 1px solid #3A3B46')};
  svg {
    margin-left: 0.125rem;
    margin-top: -1px;
  }
  &:hover {
    color: #00FF0A;
    ${(props) => (props.isLike ? ' border: 1px solid #00FF0A' : ' border: 1px solid #3A3B46')};
  }
`;
const StyleWatchWorthIcon = styled(FontAwesomeIcon)`
  width: 0.995rem;
  height: 0.997rem;
`;
function WorthWatchIcon() {
  const [liked, setLike] = useState<boolean>(true);
  const [disLiked, setDisLike] = useState<boolean>(false);
  return (
    <div className="mx-1 d-flex align-items-center justify-content-around">
      <div className="mt-2 d-flex justify-content-center ">
        <StyledLikeIcon isLike={liked} role="button" onClick={() => { setLike(!liked); setDisLike(false); }} className="d-flex justify-content-center align-items-center shadow-none bg-transparent me-2 rounded-circle">
          <StyleWatchWorthIcon icon={regular('thumbs-up')} />
        </StyledLikeIcon>
        <p className="m-0 fs-3 text-light">(99k)</p>
      </div>
      <div className="mt-2 d-flex justify-content-center ">
        <StyledDislikeIcon isDislike={disLiked} role="button" onClick={() => { setDisLike(!disLiked); setLike(false); }} className="d-flex justify-content-center align-items-center shadow-none bg-transparent me-2 rounded-circle">
          <StyleWatchWorthIcon icon={regular('thumbs-down')} />
        </StyledDislikeIcon>
        <p className="m-0 fs-3 text-light">(99k)</p>
      </div>
    </div>
  );
}

export default WorthWatchIcon;
