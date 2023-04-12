/* eslint-disable max-len */
import React, { useCallback, useEffect } from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';
import { MovieData, WorthWatchingStatus } from '../../../types';

interface LikeProps {
  isLike?: boolean;
  width?: string;
  height?: string;
  iconwidth?: string;
  iconheight?: string;
}
interface DislikeProps {
  isDislike?: boolean;
  width?: string;
  height?: string;
  iconwidth?: string;
  iconheight?: string;
}
interface IconProps {
  iconwidth?: string;
  iconheight?: string;
}

export const StyledDislikeIcon = styled.div <DislikeProps>`
  color: var(--bs-primary);
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  transform: rotateY(180deg);
  ${(props) => (props.isDislike ? ' border: 1px solid var(--bs-primary)' : ' border: 1px solid #3A3B46')};
  FontAwesomeIcon {
    width: ${(props) => (props.width ? props.iconwidth : ' 1.326rem')};
    height: ${(props) => (props.width ? props.iconheight : '1.391rem')};
  }
  &:hover {
    color: var(--bs-primary);
    ${(props) => (props.isDislike ? ' border: 1px solid var(--bs-primary)' : ' border: 1px solid #3A3B46')};
  } 
`;
export const StyledLikeIcon = styled.div <LikeProps>`
  color: var(--bs-success);
  width: ${(props) => (props.width ? props.width : '1.875rem')};
  height: ${(props) => (props.width ? props.height : '1.875rem')};
  ${(props) => (props.isLike ? ' border: 1px solid var(--bs-success)' : ' border: 1px solid #3A3B46')};
  svg {
    margin-left: 0.125rem;
    margin-top: -1px;
  } 
  FontAwesomeIcon {
    width: ${(props) => (props.width ? props.iconwidth : '')};
    height: ${(props) => (props.width ? props.iconheight : '')};
  }
  &:hover {
    color: var(--bs-success);
    ${(props) => (props.isLike ? ' border: 1px solid var(--bs-success)' : ' border: 1px solid #3A3B46')};
  }
`;
const StyleWatchWorthIcon = styled(FontAwesomeIcon) <IconProps>`
  width: ${(props) => props.iconwidth};
  height: ${(props) => props.iconheight};
`;
type Props = {
  movieData?: MovieData;
  setWorthIt?: any;
  liked: boolean;
  setLike: (val: boolean) => void;
  disLiked: boolean;
  setDisLike: (val: boolean) => void;
  postType?: string;
  circleWidth?: string;
  circleHeight?: string;
  iconWidth?: string;
  iconHeight?: string;
  isWorthIt?: number;
};
function WorthWatchIcon({
  movieData, setWorthIt, liked, setLike, disLiked, setDisLike,
  postType, circleWidth, circleHeight, iconWidth, iconHeight, isWorthIt,
}: Props) {
  useEffect(() => {
    if (isWorthIt === WorthWatchingStatus.Up && isWorthIt === 2) {
      setLike(true);
      setDisLike(false);
    }
    if (isWorthIt === WorthWatchingStatus.Down && isWorthIt === 1) {
      setDisLike(true);
      setLike(false);
    }
  }, [setLike, setDisLike, isWorthIt]);
  const handleThumbsUp = useCallback(() => {
    const alreadyLiked = isWorthIt === WorthWatchingStatus.Up;
    if (alreadyLiked) {
      setLike(false); setDisLike(false);
      setWorthIt(WorthWatchingStatus.NoRating);
    } else {
      setLike(true); setDisLike(false);
      setWorthIt(WorthWatchingStatus.Up);
    }
  }, [setLike, setDisLike, setWorthIt, isWorthIt]);

  const handleThumbsDown = useCallback(() => {
    const alreadyDisLiked = isWorthIt === WorthWatchingStatus.Down;
    if (alreadyDisLiked) {
      setLike(false); setDisLike(false);
      setWorthIt(WorthWatchingStatus.NoRating);
    } else {
      setLike(false); setDisLike(true);
      setWorthIt(WorthWatchingStatus.Down);
    }
  }, [setLike, setDisLike, setWorthIt, isWorthIt]);

  return (
    <div className="me-1 d-flex align-items-center justify-content-around">
      <div className="mt-2 d-flex justify-content-center ">
        <Button className="bg-transparent p-0 border-0 me-2 rounded-circle" onClick={handleThumbsUp}>
          <StyledLikeIcon isLike={liked} width={circleWidth} height={circleHeight} className="d-flex justify-content-center align-items-center bg-transparent rounded-circle">
            <StyleWatchWorthIcon iconwidth={iconWidth} iconheight={iconHeight} icon={regular('thumbs-up')} />
          </StyledLikeIcon>
        </Button>
        {!postType
          && (
            <p className="m-0 fs-3 text-light d-flex align-items-center">
              (
              {movieData!.worthWatchingUpUsersCount ? movieData!.worthWatchingUpUsersCount : 0}
              )
            </p>
          )}
      </div>
      <div className="mt-2 d-flex justify-content-center ">
        <Button className="bg-transparent p-0 border-0 me-2 rounded-circle" onClick={handleThumbsDown}>
          <StyledDislikeIcon isDislike={disLiked} width={circleWidth} height={circleHeight} className="d-flex justify-content-center align-items-center bg-transparent rounded-circle">
            <StyleWatchWorthIcon iconwidth={iconWidth} iconheight={iconHeight} icon={regular('thumbs-down')} />
          </StyledDislikeIcon>
        </Button>
        {!postType
          && (
            <p className="m-0 fs-3 text-light d-flex align-items-center">
              (
              {movieData!.worthWatchingDownUsersCount ? movieData!.worthWatchingDownUsersCount : 0}
              )
            </p>
          )}
      </div>
    </div>
  );
}
WorthWatchIcon.defaultProps = {
  movieData: null,
  setWorthIt: undefined,
  postType: '',
  circleWidth: '1.875rem',
  circleHeight: '1.875rem',
  iconWidth: '0.995rem',
  iconHeight: '0.997rem',
  isWorthIt: 0,
};
export default WorthWatchIcon;
