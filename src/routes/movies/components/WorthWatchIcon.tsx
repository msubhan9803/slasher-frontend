/* eslint-disable max-len */
import React, { useCallback, useEffect } from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
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

export const StyledDislikeIcon = styled.div <DislikeProps>`
  color: var(--bs-primary);
  width: ${(props) => (props.width ? props.width : '1.875rem')};
  height: ${(props) => (props.width ? props.height : '1.875rem')};
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
const StyleWatchWorthIcon = styled(FontAwesomeIcon)`
  width: 0.995rem;
  height: 0.997rem;
`;
type Props = {
  movieData?: MovieData;
  setWorthIt?: any;
  liked: boolean;
  setLike: (val: boolean) => void;
  disLiked: boolean;
  setDisLike: (val: boolean) => void;
};
function WorthWatchIcon({
  movieData, setWorthIt, liked, setLike,
  disLiked, setDisLike,
}: Props) {
  useEffect(() => {
    if (movieData!.userData?.worthWatching === WorthWatchingStatus.Up) {
      setLike(true);
      setDisLike(false);
    }
    if (movieData!.userData?.worthWatching === WorthWatchingStatus.Down) {
      setDisLike(true);
      setLike(false);
    }
  }, [movieData, setLike, setDisLike]);

  const handleThumbsUp = useCallback(() => {
    setWorthIt(WorthWatchingStatus.Up);
    setLike(true); setDisLike(false);
  }, [setLike, setDisLike, setWorthIt]);

  const handleThumbsDown = useCallback(() => {
    setWorthIt(WorthWatchingStatus.Down);
    setLike(false); setDisLike(true);
  }, [setLike, setDisLike, setWorthIt]);
  return (
    <div className="mx-1 d-flex align-items-center justify-content-around">
      <div className="mt-2 d-flex justify-content-center ">
        <StyledLikeIcon isLike={liked} role="button" onClick={handleThumbsUp} className="d-flex justify-content-center align-items-center shadow-none bg-transparent me-2 rounded-circle">
          <StyleWatchWorthIcon icon={regular('thumbs-up')} />
        </StyledLikeIcon>
        <p className="m-0 fs-3 text-light">
          (
          {movieData!.worthWatchingUpUsersCount ? movieData!.worthWatchingUpUsersCount : 0}
          )
        </p>
      </div>
      <div className="mt-2 d-flex justify-content-center ">
        <StyledDislikeIcon isDislike={disLiked} role="button" onClick={handleThumbsDown} className="d-flex justify-content-center align-items-center shadow-none bg-transparent me-2 rounded-circle">
          <StyleWatchWorthIcon icon={regular('thumbs-down')} />
        </StyledDislikeIcon>
        <p className="m-0 fs-3 text-light">
          (
          {movieData!.worthWatchingDownUsersCount ? movieData!.worthWatchingDownUsersCount : 0}
          )
        </p>
      </div>
    </div>
  );
}
WorthWatchIcon.defaultProps = {
  movieData: null,
  setWorthIt: undefined,
};
export default WorthWatchIcon;
