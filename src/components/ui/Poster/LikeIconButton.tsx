import React from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { WorthWatchingStatus } from '../../../types';

interface StyledLikeButtonProps {
  thumbsUpWidth: string;
  thumbsUpHeight: string;
  thumbsDownWidth: string;
  thumbsDownHeight: string;
}

const StyledLikeButton = styled.div<StyledLikeButtonProps>`
  width: 1.514rem;
  height: 1.514rem;
  border: 1px solid #3A3B46;
  background-color: #1F1F1F;
  .fa-thumbs-up {
    color: var(--bs-success);
    width: ${(props) => props.thumbsUpWidth};
    height: ${(props) => props.thumbsUpWidth};
  }
  .fa-thumbs-down {
    color: var(--bs-primary);
    transform: rotateY(180deg);
    width: ${(props) => props.thumbsDownWidth};
    height: ${(props) => props.thumbsDownHeight};
  }
}
`;
function LikeIconButton({
  worthWatching, thumbsUpWidth, thumbsUpHeight, thumbsDownWidth,
  thumbsDownHeight, isRecentMediaTile,
}: any) {
  return (
    <StyledLikeButton
      thumbsUpWidth={thumbsUpWidth}
      thumbsUpHeight={thumbsUpHeight}
      thumbsDownWidth={thumbsDownWidth}
      thumbsDownHeight={thumbsDownHeight}
      className={`align-items-center d-flex justify-content-center ${!isRecentMediaTile && 'me-2'} p-1 rounded-circle`}
    >
      <FontAwesomeIcon
        icon={worthWatching === WorthWatchingStatus.Up ? regular('thumbs-up') : regular('thumbs-down')}
        className="border-0"
      />
    </StyledLikeButton>
  );
}

export default LikeIconButton;
