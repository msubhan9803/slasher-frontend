/* eslint-disable max-len */
import React, { useCallback, useState } from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { MovieData, WorthWatchingStatus } from '../../../types';
import { createOrUpdateWorthWatching } from '../../../api/movies';
import { updateMovieUserData } from './updateMovieDataUtils';

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
  color: #FF1800;
  width: ${(props) => (props.width ? props.width : '1.875rem')};
  height: ${(props) => (props.width ? props.height : '1.875rem')};
  transform: rotateY(180deg);
  ${(props) => (props.isDislike ? ' border: 1px solid #FF1800' : ' border: 1px solid #3A3B46')};
  FontAwesomeIcon {
    width: ${(props) => (props.width ? props.iconwidth : ' 1.326rem')};
    height: ${(props) => (props.width ? props.iconheight : '1.391rem')};
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
  FontAwesomeIcon {
    width: ${(props) => (props.width ? props.iconwidth : '')};
    height: ${(props) => (props.width ? props.iconheight : '')};
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
type Props = {
  movieData?: MovieData;
  setMovieData?: React.Dispatch<React.SetStateAction<MovieData | undefined>>;
};
function WorthWatchIcon({ movieData, setMovieData }: Props) {
  const [liked, setLike] = useState<boolean>(movieData!.userData?.worthWatching === WorthWatchingStatus.Up);
  const [disLiked, setDisLike] = useState<boolean>(movieData!.userData?.worthWatching === WorthWatchingStatus.Down);
  const params = useParams();
  const handleThumbsUp = useCallback(() => {
    if (!params?.id) { return; }
    createOrUpdateWorthWatching(params.id, WorthWatchingStatus.Up).then((res) => {
      updateMovieUserData(res.data, 'worthWatching', setMovieData!);
      setLike(true); setDisLike(false);
    });
  }, [params, setMovieData]);

  const handleThumbsDown = useCallback(() => {
    if (!params?.id) { return; }
    createOrUpdateWorthWatching(params.id, WorthWatchingStatus.Down).then((res) => {
      updateMovieUserData(res.data, 'worthWatching', setMovieData!);
      setLike(false); setDisLike(true);
    });
  }, [params.id, setMovieData]);
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
  setMovieData: undefined,
};
export default WorthWatchIcon;
